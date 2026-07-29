# Problem validation guide (YAML)

Add or edit problems in `backend/src/main/resources/problems/{CHAPTER}.yaml` (one file per chapter: `ST.yaml`, `LR.yaml`, …). On backend start, `ProblemDataSeeder` loads titles/text into the DB; `ValidationSpecRegistry` loads the `validation` blocks used by **Submit**.

**Flow:** student circuit → frontend assigns **roles** → each **case** sets controls → ngspice runs (DC or transient) → each **check** compares a measured value to a threshold. All cases must pass.

---

## Problem entry

```yaml
chapter: ST          # must match filename / existing DB chapter code
problems:
- code: ST.L1.99           # unique; usually CHAPTER.L{level}.{n}
  title: Short title
  displayOrder: 99         # list order; use >= 10000 only for validation-only orphans (not shown in UI)
  difficulty: beginner     # beginner | intermediate | advanced (or L1/L2/L3-style labels already used)
  description: |
    Task text shown to the student…
  hint: Optional hint
  questions: |-
    Optional discussion questions
  methodology: Optional teacher note
  validation:              # omit = no auto-grade (practice / quiz only)
    cases:
      - …                  # see below
```

Copy a similar problem in the same chapter and adapt it. After editing YAML, **restart the backend** so seed + registry reload.

> Frontend palette: if the chapter limits allowed parts, also update the inventory in `frontend/src/constants/componentCatalog.js`. Validation alone does not add parts to the palette.

---

## Validation case

| Field | Required | Meaning |
|--------|----------|---------|
| `label` | yes | Stable English id (shown in API / logs) |
| `labelKa` | recommended | Georgian label for UI feedback |
| `switchStates` | usually | Forced states of interactive parts (by **role**) |
| `checks` | yes | One or more pass/fail measurements |
| `simPhase` | no | If set → time-domain run; omit → DC steady-state |
| `potPositions` | no | Pot wiper position `role → 0.0…1.0` |
| `lightLevels` | no | Photoresistor light `role → 0.0…1.0` (0 dark … 1 bright) |
| `priorPotPositions` | no | Wiper **before** this case (hysteresis / latch, TFB) |
| `priorSwitchStates` | no | Switch states before this case (rare) |

**Switch / button / SPDT values**

| Role pattern | States |
|--------------|--------|
| `button_1`, `button_2`, … | `open` / `closed` |
| `switch` (SPST toggle) | `open` / `closed` |
| `slide_switch` or `slide_switch_1`… | `left` / `right` |

Any role named in `switchStates` or in a check must exist on the student’s board (except aggregate role `leds`). Missing parts → validation fails early.

---

## Roles (how parts are named)

Roles are assigned by **placement order** on the board (not by the student):

| Part | Role(s) |
|------|---------|
| Button | `button_1`, `button_2`, … |
| SPST switch | `switch` |
| SPDT slide | `slide_switch` (one) or `slide_switch_1`, `_2`, … |
| Lamp | `lamp` |
| LED | `led_1`, `led_2`, … (also `led_red` / `led_green` by color) |
| Motor | `motor_1`, … |
| Pot | `variable_resistor` or `variable_resistor_1`, … |
| Photoresistor | `photo_resistor` or `photo_resistor_1`, … |
| Aggregate (multi-LED metrics) | `leds` |

Use the same role strings in `switchStates`, `potPositions`, `lightLevels`, and `checks[].role`.

---

## Checks

```yaml
checks:
- role: lamp          # which part
  metric: current     # what to measure
  op: gt              # comparison
  value: 0.01         # threshold (amps for currents, seconds for times, …)
```

**Operators:** `gt` `gte` `lt` `lte` `eq` (`eq` ≈ within 0.01)

### Common metrics

| Metric | Typical use |
|--------|-------------|
| `current` | \|I\| on lamp / motor / resistor (amps) |
| `forward_current` | LED (or diode) forward current; “lit” often `> 0.001`–`0.003` |
| `voltage` | \|V\| on a part |
| `current_vs_prior` | This case vs previous case (brighter / dimmer) |
| `current_reversed_vs_prior` | Motor polarity flipped vs previous case (`1` / `0`) |
| `current_ratio` | Ratio involving LED / load currents |
| `forward_current_vs_prior_ratio` | Photoresistor: brighter light → higher LED current |
| `led_min_forward_current` / `led_max_forward_current` | Across all LEDs (`role: leds`) |
| `lit_count` | How many LEDs are “on” |

### Transient metrics (`simPhase` required)

Phases: `idle` | `pressed` | `discharge` | `tapping` (meaning depends on chapter; see `SimPhase.java` / existing CP/TCP/DTR YAML).

| Metric | Meaning |
|--------|---------|
| `tran_forward_current_start` / `_end` / `_peak` / `_min` | LED forward I at start / end / peak / min of waveform |
| `tran_forward_current_early` | Early sample (charge / fade shape) |
| `tran_current_abs_start` / `_end` / `_peak` / `_early` / `_at_1`… | \|I\| samples (motors, lamps) |
| `tran_current_flip_sign` | Polarity reversed during run |
| `tran_lit_time` / `tran_extinguish_time` | When LED crosses lit threshold |

Rule of thumb: **on** → `forward_current` / `current` `gt` ~`0.01` (lamp) or ~`0.001` (LED); **off** → `lt` ~`0.001`.

---

## Forced states — worked examples

Each **case** is one forced world: set every control the statement cares about, then assert what the load should do. Use **one case per distinct behaviour**. Cases run in order; metrics like `*_vs_prior` compare to the previous case.

### 1. Button only (on / off)

```yaml
validation:
  cases:
  - label: button_pressed
    labelKa: ღილაკი დაჭერილი
    switchStates:
      button_1: closed
    checks:
    - role: lamp
      metric: current
      op: gt
      value: 0.01
  - label: button_released
    labelKa: ღილაკი გაშვებული
    switchStates:
      button_1: open
    checks:
    - role: lamp
      metric: current
      op: lt
      value: 0.001
```

### 2. SPST switch + button (AND truth table)

Force **both** parts in every case. Only the combination you care about should light the lamp:

```yaml
cases:
- label: switch_off_button_open
  switchStates: { switch: open, button_1: open }
  checks: [{ role: lamp, metric: current, op: lt, value: 0.001 }]
- label: switch_off_button_pressed
  switchStates: { switch: open, button_1: closed }
  checks: [{ role: lamp, metric: current, op: lt, value: 0.001 }]
- label: switch_on_button_open
  switchStates: { switch: closed, button_1: open }
  checks: [{ role: lamp, metric: current, op: lt, value: 0.001 }]
- label: switch_on_button_pressed
  switchStates: { switch: closed, button_1: closed }
  checks: [{ role: lamp, metric: current, op: gt, value: 0.01 }]
```

### 3. Two buttons (OR / series / exclusive)

Name them `button_1` and `button_2` (placement order). Example — lamp only if **either** button is pressed (switch already on):

```yaml
cases:
- label: both_open
  switchStates: { switch: closed, button_1: open, button_2: open }
  checks: [{ role: lamp, metric: current, op: lt, value: 0.001 }]
- label: only_button_1
  switchStates: { switch: closed, button_1: closed, button_2: open }
  checks: [{ role: lamp, metric: current, op: gt, value: 0.01 }]
- label: only_button_2
  switchStates: { switch: closed, button_1: open, button_2: closed }
  checks: [{ role: lamp, metric: current, op: gt, value: 0.01 }]
- label: both_pressed
  switchStates: { switch: closed, button_1: closed, button_2: closed }
  checks: [{ role: lamp, metric: current, op: gt, value: 0.01 }]
```

For exclusive OR, change `both_pressed` to expect **off** (`lt`).

### 4. One SPDT slide (`left` / `right`)

```yaml
cases:
- label: slide_left
  labelKa: გადამრთველი A–B
  switchStates:
    slide_switch: left
  checks:
  - role: leds
    metric: lit_count
    op: eq
    value: 1.0
- label: slide_right
  labelKa: გადამრთველი A–C
  switchStates:
    slide_switch: right
  checks:
  - role: leds
    metric: lit_count
    op: eq
    value: 1.0
  - role: leds
    metric: lit_set_changed   # different LED than previous case
    op: gt
    value: 0.0
```

### 5. Two SPDTs

With two slides, roles are `slide_switch_1` and `slide_switch_2`:

```yaml
cases:
- label: both_left
  switchStates: { slide_switch_1: left, slide_switch_2: left }
  checks: [{ role: lamp, metric: current, op: gt, value: 0.02 }]
- label: toggle_first
  switchStates: { slide_switch_1: right, slide_switch_2: left }
  checks: [{ role: lamp, metric: lamp_lit_changed, op: gt, value: 0.0 }]
- label: toggle_second
  switchStates: { slide_switch_1: right, slide_switch_2: right }
  checks: [{ role: lamp, metric: lamp_lit_changed, op: gt, value: 0.0 }]
```

### 6. Mixed controls (switch + button + slide)

Set **all** interactive parts every time — otherwise leftover live UI state can leak in:

```yaml
cases:
- label: power_off
  switchStates: { switch: open, button_1: open, slide_switch: left }
  checks: [{ role: led_1, metric: forward_current, op: lt, value: 0.001 }]
- label: power_on_slide_left
  switchStates: { switch: closed, button_1: open, slide_switch: left }
  checks: [{ role: led_1, metric: forward_current, op: gt, value: 0.0005 }]
- label: power_on_button_and_slide_right
  switchStates: { switch: closed, button_1: closed, slide_switch: right }
  checks: [{ role: led_1, metric: forward_current, op: gt, value: 0.001 }]
```

### 7. Potentiometer wiper (`potPositions`)

`0.0` = one end, `1.0` = other end, `0.5` = mid. Single pot role is usually `variable_resistor`:

```yaml
cases:
- label: switch_off
  switchStates: { switch: open }
  potPositions: { variable_resistor: 0.0 }
  checks: [{ role: lamp, metric: current, op: lt, value: 0.001 }]
- label: pot_off_end
  switchStates: { switch: closed }
  potPositions: { variable_resistor: 0.0 }
  checks: [{ role: lamp, metric: current, op: lt, value: 0.01 }]
- label: pot_mid_on
  switchStates: { switch: closed }
  potPositions: { variable_resistor: 0.5 }
  checks: [{ role: lamp, metric: current, op: gt, value: 0.05 }]
- label: pot_full
  switchStates: { switch: closed }
  potPositions: { variable_resistor: 1.0 }
  checks:
  - { role: lamp, metric: current, op: gt, value: 0.05 }
  - { role: lamp, metric: current_vs_prior, op: gt, value: 0.0 }  # brighter than mid
```

Sweep several positions (e.g. RGB sequence at `0.0`, `0.38`, `0.58`, `1.0`) when the statement describes gradual behaviour.

### 8. Two pots

Roles become `variable_resistor_1` and `variable_resistor_2`:

```yaml
cases:
- label: both_mid
  switchStates: { switch: closed }
  potPositions: { variable_resistor_1: 0.5, variable_resistor_2: 0.5 }
  checks: [{ role: led_1, metric: forward_current, op: gt, value: 0.0002 }]
- label: move_first_only
  switchStates: { switch: closed }
  potPositions: { variable_resistor_1: 0.0, variable_resistor_2: 0.5 }
  checks: [{ role: led_1, metric: forward_current_vs_prior_ratio, op: gt, value: 1.3 }]
```

### 9. Photoresistor light (`lightLevels`)

`0.0` = covered / dark, ~`0.35` = ambient, `1.0` = torch. Combine with the power switch:

```yaml
cases:
- label: switch_off
  switchStates: { switch: open }
  checks: [{ role: led_1, metric: forward_current, op: lt, value: 0.0005 }]
- label: ambient
  switchStates: { switch: closed }
  lightLevels: { photo_resistor: 0.352 }
  checks: [{ role: led_1, metric: forward_current, op: gt, value: 0.00008 }]
- label: torch
  switchStates: { switch: closed }
  lightLevels: { photo_resistor: 1.0 }
  checks:
  - { role: led_1, metric: forward_current, op: gt, value: 0.001 }
  - { role: led_1, metric: forward_current_vs_prior_ratio, op: gt, value: 1.2 }
- label: covered
  switchStates: { switch: closed }
  lightLevels: { photo_resistor: 0.0 }
  checks: [{ role: led_1, metric: forward_current, op: lt, value: 0.0003 }]
```

### 10. Slide + light together

```yaml
- label: slide_left_torch
  switchStates: { slide_switch: left, switch: closed }
  lightLevels: { photo_resistor: 1.0 }
  checks: [{ role: led_1, metric: forward_current, op: gt, value: 0.004 }]
- label: slide_right_torch
  switchStates: { slide_switch: right, switch: closed }
  lightLevels: { photo_resistor: 1.0 }
  checks: [{ role: led_1, metric: forward_current, op: lt, value: 0.001 }]
```

### 11. Transient phase (`simPhase`)

Omit `simPhase` → DC. Set it for charge / discharge / fade. Keep switch/button state consistent with that phase:

```yaml
cases:
- label: button_open
  switchStates: { button_1: open }
  checks: [{ role: led_1, metric: forward_current, op: lt, value: 0.001 }]
- label: button_pressed_instant
  switchStates: { button_1: closed }
  checks: [{ role: led_1, metric: forward_current, op: gt, value: 0.003 }]
- label: discharge_fade
  switchStates: { button_1: open }
  simPhase: discharge          # idle | pressed | discharge | tapping
  checks:
  - { role: led_1, metric: tran_forward_current_start, op: gt, value: 0.001 }
  - { role: led_1, metric: tran_forward_current_end, op: lt, value: 0.001 }
```

### 12. Hysteresis / latch (`priorPotPositions`)

Same target wiper, different history → different outcome. Set **where the pot was** (`priorPotPositions`) and **where it is now** (`potPositions`):

```yaml
cases:
- label: rising_near_off_stays_off
  switchStates: { switch: closed }
  potPositions: { variable_resistor: 0.05 }
  priorPotPositions: { variable_resistor: 0.0 }   # coming from OFF end
  checks: [{ role: lamp, metric: current, op: lt, value: 0.01 }]
- label: rising_snap_on
  switchStates: { switch: closed }
  potPositions: { variable_resistor: 0.5 }
  priorPotPositions: { variable_resistor: 0.0 }
  checks: [{ role: lamp, metric: current, op: gt, value: 0.05 }]
- label: falling_same_zone_stays_on
  switchStates: { switch: closed }
  potPositions: { variable_resistor: 0.05 }
  priorPotPositions: { variable_resistor: 1.0 }   # coming from ON end
  checks: [{ role: lamp, metric: current, op: gt, value: 0.05 }]
```

### Quick reference — what to force

| You want to test… | Put in the case |
|-------------------|-----------------|
| Button / SPST | `switchStates: { button_1: open\|closed }` / `switch: …` |
| SPDT | `slide_switch: left\|right` (or `_1` / `_2`) |
| Pot angle | `potPositions: { variable_resistor: 0.0…1.0 }` |
| Torch / cover | `lightLevels: { photo_resistor: 0.0…1.0 }` |
| Time behaviour | `simPhase: idle\|pressed\|discharge\|tapping` + `tran_*` metrics |
| Hysteresis | `priorPotPositions` + `potPositions` |
| Several controls at once | List **every** interactive role in that case |

---

## Author checklist

1. Write pedagogical cases (every distinct behaviour the statement requires).
2. Match **roles** to what students will place (same counts as in the statement).
3. Prefer copying thresholds from a neighbour problem in the same chapter.
4. Restart backend; place a known-good circuit; hit Submit; tighten thresholds if flaky.
5. Optional: add/adjust a test under `backend/src/test/java/.../*ValidationTest.java`.

Hard chapters (CP, PR, TFB, TCP) already encode charge/discharge, light ratios, and hysteresis—**copy those patterns** rather than inventing new metrics unless a developer adds support in `CircuitValidationService`.
