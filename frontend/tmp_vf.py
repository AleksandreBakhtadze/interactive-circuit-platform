#!/usr/bin/env python3
import math

def vf(Is, n, RS, I):
    return n * 0.026 * math.log(I / Is) + I * RS

for name, Is, n, RS in [
    ("diode_old", 1e-10, 1.0, 1),
    ("diode_soft", 5e-7, 1.15, 2),
    ("diode_schottky", 1e-5, 1.05, 1),
    ("led_red", 9e-21, 1.9, 2),
    ("led_rs25", 9e-21, 1.9, 25),
    ("led_rs60", 9e-21, 1.9, 60),
]:
    for I in [1e-3, 5e-3, 1e-2]:
        print(f"{name} I={I*1000:.1f}mA V={vf(Is, n, RS, I):.3f}")
    print()

# Parallel share: find V where I_led(V) + I_stack(V) = V_join/R with TOP=12, R=1000
# V_branch = 12 - V_join, I_r = V_join/1000
print("--- seek operating point ---")
# Approximate stack as led_vf(I) + 2*diode_vf(I)

def led_i(V, Is=9e-21, n=1.9, RS=2):
    # solve I from V = n*Vt*ln(I/Is) + I*RS iteratively
    I = 1e-6
    for _ in range(40):
        if I <= 0:
            I = 1e-12
        f = n * 0.026 * math.log(I / Is) + I * RS - V
        df = n * 0.026 / I + RS
        I = max(1e-15, I - f / df)
    return I

def stack_i(V, dIs, dn, dRS, lRS=2):
    # V = Vled(I) + 2*Vd(I)
    I = 1e-6
    for _ in range(50):
        if I <= 0:
            I = 1e-12
        Vl = 1.9 * 0.026 * math.log(I / 9e-21) + I * lRS
        Vd = dn * 0.026 * math.log(I / dIs) + I * dRS
        f = Vl + 2 * Vd - V
        df = 1.9 * 0.026 / I + lRS + 2 * (dn * 0.026 / I + dRS)
        I = max(1e-15, I - f / df)
    return I

for lRS, dIs, dn, dRS, label in [
    (2, 1e-10, 1.0, 1, "old"),
    (40, 1e-5, 1.05, 1, "ledRS40+schottky"),
    (80, 1e-5, 1.05, 1, "ledRS80+schottky"),
    (120, 5e-6, 1.1, 2, "ledRS120+soft"),
]:
    # scan V_branch
    best = None
    for Vb in [x * 0.05 for x in range(30, 80)]:
        i2 = led_i(Vb, RS=lRS)
        i1 = stack_i(Vb, dIs, dn, dRS, lRS)
        Vj = 12 - Vb
        ir = Vj / 1000
        err = abs(i1 + i2 - ir)
        if best is None or err < best[0]:
            best = (err, Vb, i1, i2, ir)
    print(label, "Vb=%.2f I_weak=%.4f I_bright=%.4f I_r=%.4f err=%.4f ratio=%.2f" % (
        best[1], best[2], best[3], best[4], best[0],
        best[3] / best[2] if best[2] > 1e-9 else 0))
