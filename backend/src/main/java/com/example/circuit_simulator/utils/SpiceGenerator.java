package com.example.circuit_simulator.utils;

import com.example.circuit_simulator.simulation.TranProbe;
import com.example.circuit_simulator.simulation.TranScenario;
import com.example.circuit_simulator.simulation.TranSpiceBuild;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.Locale;

public class SpiceGenerator {

    /** True when a two-terminal part has both ends on the same net (e.g. V 0 0). */
    public static boolean isShortedTwoTerminal(List<String> nodes) {
        return nodes != null
                && nodes.size() >= 2
                && nodes.get(0) != null
                && nodes.get(0).equals(nodes.get(1));
    }

    /**
     * ngspice segfaults (exit 139) on {@code Vx n n …}. Skip those sources and
     * require at least one real supply so the board can still simulate.
     */
    @SuppressWarnings("unchecked")
    public static void assertSimulatableSupplies(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");
        if (components == null || components.isEmpty()) {
            throw new IllegalArgumentException("Circuit has no components");
        }
        int supplies = 0;
        int shorted = 0;
        for (Map<String, Object> comp : components) {
            if (!"voltage".equals(comp.get("type"))) {
                continue;
            }
            List<String> nodes = (List<String>) comp.get("nodes");
            if (isShortedTwoTerminal(nodes)) {
                shorted += 1;
            } else {
                supplies += 1;
            }
        }
        if (supplies == 0) {
            if (shorted > 0) {
                throw new IllegalArgumentException(
                        "Power supply terminals are shorted together. "
                                + "For two supplies in series, connect + of one to − of the other "
                                + "(mid-rail), and only one end to ground.");
            }
            throw new IllegalArgumentException("Circuit has no power supply");
        }
    }

    /**
     * When two packs share a rail on the same polarity end (+/+ or −/−), flip the
     * second so they add in series. Snap-kit series stacks always mean + to −.
     */
    @SuppressWarnings("unchecked")
    public static String normalizeSeriesSupplyPolarity(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");
        if (components == null) {
            return json;
        }
        List<Map<String, Object>> supplies = new ArrayList<>();
        for (Map<String, Object> comp : components) {
            if ("voltage".equals(comp.get("type"))) {
                supplies.add(comp);
            }
        }
        if (supplies.size() != 2) {
            return json;
        }
        List<String> firstNodes = (List<String>) supplies.get(0).get("nodes");
        List<String> secondNodes = (List<String>) supplies.get(1).get("nodes");
        if (firstNodes == null || secondNodes == null
                || firstNodes.size() < 2 || secondNodes.size() < 2) {
            return json;
        }
        List<String> shared = new ArrayList<>();
        for (String node : firstNodes) {
            if (secondNodes.contains(node)) {
                shared.add(node);
            }
        }
        if (shared.size() != 1) {
            return json;
        }
        String mid = shared.get(0);
        if (firstNodes.indexOf(mid) == secondNodes.indexOf(mid)) {
            List<String> flipped = new ArrayList<>(secondNodes);
            Collections.swap(flipped, 0, 1);
            supplies.get(1).put("nodes", flipped);
            return mapper.writeValueAsString(data);
        }
        return json;
    }

    public static String generateSpice(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);

        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        StringBuilder sb = new StringBuilder();
        Set<String> nodesSet = new HashSet<>();

        sb.append("* auto-generated circuit\n");

        for (Map<String, Object> comp : components) {
            String id = (String) comp.get("id");
            String type = (String) comp.get("type");
            List<String> nodes = (List<String>) comp.get("nodes");
            String value = (String) comp.get("value");

            // collect nodes
            nodesSet.addAll(nodes);

            switch (type) {
                case "voltage":
                    // V n n crashes ngspice (SIGSEGV / exit 139) — omit shorted supplies.
                    if (isShortedTwoTerminal(nodes)) {
                        sb.append("* skipped shorted voltage ").append(id).append("\n");
                        break;
                    }
                    sb.append("V_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1))
                            .append(" DC ").append(value).append("\n");
                    break;

                case "resistor":
                    sb.append("R_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(value).append("\n");
                    break;

                case "lamp":
                    sb.append("R_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" 100\n");
                    break;

                case "switch":
                    String state = (String) comp.get("state");
                    String resistance = "open".equals(state) ? "1e12" : "0.00001";

                    sb.append("R_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(resistance).append("\n");
                    break;

                case "led":
                    String color = (String) comp.get("color"); // null if not specified
                    String ledModel;
                    if (color == null || color.equals("plain")) {
                        ledModel = "DIODE_MODEL";   // generic diode
                    } else {
                        ledModel = switch (color) {
                            case "green" -> "LEDMODEL_GREEN";
                            case "blue"  -> "LEDMODEL_BLUE";
                            default      -> "LEDMODEL_RED";
                        };
                    }
                    sb.append("D_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(ledModel).append("\n");
                    break;

                case "capacitor":
                    sb.append("C_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(value).append("\n");
                    break;
                case "motor":
                    sb.append("R_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(motorResistanceOhms(comp)).append("\n");
                    break;
                case "slide_switch":

                    String slideState = (String) comp.get("state"); // rename variable

                    String common = nodes.get(0);
                    String left = nodes.get(1);
                    String right = nodes.get(2);

                    if ("left".equals(slideState)) {
                        sb.append("R_").append(id).append("_L ")
                                .append(common).append(" ")
                                .append(left).append(" 0.00001\n");

                        sb.append("R_").append(id).append("_R ")
                                .append(common).append(" ")
                                .append(right).append(" 1e12\n");

                    } else {
                        sb.append("R_").append(id).append("_L ")
                                .append(common).append(" ")
                                .append(left).append(" 1e12\n");

                        sb.append("R_").append(id).append("_R ")
                                .append(common).append(" ")
                                .append(right).append(" 0.00001\n");
                    }

                    break;
                case "variable_resistor":
                    String vrValue = (String) comp.get("value"); // e.g. "10000"
                    double maxR = Double.parseDouble(vrValue);

                    // position: 0.0 (full left) to 1.0 (full right), default 0.5
                    Object posObj = comp.get("position");
                    double pos = posObj != null ? Double.parseDouble(posObj.toString()) : 0.5;

                    double r1 = maxR * pos;           // wiper to left end
                    double r2 = maxR * (1.0 - pos);   // wiper to right end

                    // Kit pot end-stop / protective floor (~50 Ω) — avoids a dead short.
                    if (r1 < 50) r1 = 50;
                    if (r2 < 50) r2 = 50;

                    String common_vr = nodes.get(0); // wiper
                    String left_vr   = nodes.get(1);
                    String right_vr  = nodes.get(2);

                    sb.append("R_").append(id).append("_L ")
                            .append(common_vr).append(" ")
                            .append(left_vr).append(" ")
                            .append(r1).append("\n");

                    sb.append("R_").append(id).append("_R ")
                            .append(common_vr).append(" ")
                            .append(right_vr).append(" ")
                            .append(r2).append("\n");
                    break;
                case "transistor":
                    String subtype = (String) comp.get("subtype");
                    String model;
                    switch (subtype) {
                        case "npn"           -> model = "NPN_MODEL";
                        case "npn_darlington"-> model = "NPN_DARLINGTON";
                        case "pnp"           -> model = "PNP_MODEL";
                        case "pnp_darlington"-> model = "PNP_DARLINGTON";
                        default              -> model = "NPN_MODEL";
                    }
                    // nodes: base, collector, emitter
                    sb.append("Q_").append(id).append(" ")
                            .append(nodes.get(1)).append(" ")  // collector
                            .append(nodes.get(0)).append(" ")  // base
                            .append(nodes.get(2)).append(" ")  // emitter
                            .append(model).append("\n");
                    break;
            }
        }

        // Remove ground node "0"
        nodesSet.remove("0");
        for (String node : nodesSet) {
            // Change this line in generateSpice():
            sb.append("R_GND_").append(node)
                    .append(" ").append(node).append(" 0 1e12\n"); // 1e12 instead of 1e9
        }

        appendModels(sb);
        sb.append(".options savecurrents\n");
        sb.append("\n.control\n");
        sb.append("op\n");
        sb.append("print all\n");
        sb.append("\n");

        sb.append("quit\n");
        sb.append(".endc\n");

        sb.append(".end\n");

        return sb.toString();
    }

    /**
     * Transient netlist: momentary switches as voltage-controlled S-elements with PWL control.
     */
    public static TranSpiceBuild generateTranSpice(String json, TranScenario scenario)
            throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);

        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        StringBuilder sb = new StringBuilder();
        Set<String> nodesSet = new HashSet<>();
        List<TranProbe> probes = new ArrayList<>();

        sb.append("* auto-generated transient circuit\n");

        for (Map<String, Object> comp : components) {
            String id = (String) comp.get("id");
            String type = (String) comp.get("type");
            List<String> nodes = (List<String>) comp.get("nodes");
            String value = (String) comp.get("value");
            String role = (String) comp.get("role");

            nodesSet.addAll(nodes);

            switch (type) {
                case "voltage" -> {
                    if (isShortedTwoTerminal(nodes)) {
                        sb.append("* skipped shorted voltage ").append(id).append("\n");
                    } else {
                        sb.append("V_").append(id).append(" ")
                                .append(nodes.get(0)).append(" ")
                                .append(nodes.get(1))
                                .append(" DC ").append(value).append("\n");
                    }
                }

                case "resistor" -> sb.append("R_").append(id).append(" ")
                        .append(nodes.get(0)).append(" ")
                        .append(nodes.get(1)).append(" ")
                        .append(value).append("\n");

                case "lamp" -> {
                    sb.append("R_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" 100\n");
                    probes.add(new TranProbe(id, "current",
                            "@r_" + id.toLowerCase() + "[i]"));
                    probes.add(new TranProbe(id, "voltage", voltageExpression(nodes)));
                }

                case "switch" -> appendTranSwitch(
                        sb, nodesSet, id, role, nodes, scenario, (String) comp.get("state"));

                case "led" -> {
                    String color = (String) comp.get("color");
                    String ledModel = ledModelForColor(color);
                    sb.append("D_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(ledModel).append("\n");
                    probes.add(new TranProbe(id, "forward_current",
                            "@d_" + id.toLowerCase() + "[id]"));
                }

                case "capacitor" -> sb.append("C_").append(id).append(" ")
                        .append(nodes.get(0)).append(" ")
                        .append(nodes.get(1)).append(" ")
                        .append(value).append("\n");

                case "motor" -> {
                    sb.append("R_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(motorResistanceOhms(comp)).append("\n");
                    probes.add(new TranProbe(id, "current",
                            "@r_" + id.toLowerCase() + "[i]"));
                }

                case "slide_switch" -> appendSlideSwitch(sb, id, nodes, comp);

                case "variable_resistor" -> appendVariableResistor(sb, id, nodes, comp);

                case "transistor" -> appendTransistor(sb, id, nodes, comp);

                default -> { /* unsupported in tran for now */ }
            }
        }

        nodesSet.remove("0");
        for (String node : nodesSet) {
            sb.append("R_GND_").append(node)
                    .append(" ").append(node).append(" 0 1e12\n");
        }

        appendModels(sb);
        sb.append(".model SW_BTN SW(Ron=1e-5 Roff=1e12 Vt=2.5 Vh=-0.5)\n");
        // Required for @d_<id>[id] / @r_<id>[i] in wrdata during .tran (DC netlist already sets this).
        sb.append(".options savecurrents\n");

        sb.append("\n.control\n");
        sb.append(String.format(Locale.US, "tran %.6f %.6f uic\n",
                scenario.step(), scenario.stop()));
        sb.append("wrdata tran_out.txt");
        for (TranProbe probe : probes) {
            sb.append(" ").append(probe.wrdataExpression());
        }
        sb.append("\nquit\n.endc\n.end\n");

        return new TranSpiceBuild(sb.toString(), probes, scenario);
    }

    /**
     * CP.L2.7 polarity flip: replace SPDT resistors with a slow PWL on the common
     * node (prior rail → new rail) plus capacitor/LED-node ICs from prior DC.
     * Instant SPDT reconnect fights node ICs and snaps the old LED off.
     */
    @SuppressWarnings("unchecked")
    public static TranSpiceBuild generateParallelCapPolarityTranSpice(
            String json,
            Map<String, Double> priorNodes,
            boolean toRight,
            TranScenario scenario) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        StringBuilder sb = new StringBuilder();
        Set<String> nodesSet = new HashSet<>();
        Set<String> drivenNodes = new HashSet<>();
        List<TranProbe> probes = new ArrayList<>();

        sb.append("* CP.L2.7 parallel-cap polarity transient\n");

        for (Map<String, Object> comp : components) {
            String type = (String) comp.get("type");
            List<String> nodes = (List<String>) comp.get("nodes");
            if ("voltage".equals(type) && nodes != null) {
                drivenNodes.addAll(nodes);
            }
        }
        drivenNodes.remove("0");

        for (Map<String, Object> comp : components) {
            String id = (String) comp.get("id");
            String type = (String) comp.get("type");
            List<String> nodes = (List<String>) comp.get("nodes");
            String value = (String) comp.get("value");
            String role = (String) comp.get("role");

            nodesSet.addAll(nodes);

            switch (type) {
                case "voltage" -> {
                    if (isShortedTwoTerminal(nodes)) {
                        sb.append("* skipped shorted voltage ").append(id).append("\n");
                    } else {
                        sb.append("V_").append(id).append(" ")
                                .append(nodes.get(0)).append(" ")
                                .append(nodes.get(1))
                                .append(" DC ").append(value).append("\n");
                    }
                }

                case "resistor" -> sb.append("R_").append(id).append(" ")
                        .append(nodes.get(0)).append(" ")
                        .append(nodes.get(1)).append(" ")
                        .append(value).append("\n");

                case "switch" -> appendTranSwitch(
                        sb, nodesSet, id, role, nodes, scenario, (String) comp.get("state"));

                case "led" -> {
                    String color = (String) comp.get("color");
                    String ledModel = ledModelForColor(color);
                    sb.append("D_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(ledModel).append("\n");
                    probes.add(new TranProbe(id, "forward_current",
                            "@d_" + id.toLowerCase() + "[id]"));
                }

                case "capacitor" -> {
                    double ic = nodeVoltage(priorNodes, nodes.get(0))
                            - nodeVoltage(priorNodes, nodes.get(1));
                    sb.append("C_").append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(value)
                            .append(String.format(Locale.US, " ic=%.6f\n", ic));
                }

                case "slide_switch" -> {
                    drivenNodes.add(nodes.get(0));
                    appendPolarityPwlDrive(
                            sb, id, nodes, priorNodes, toRight, scenario.stop());
                }

                default -> { /* unused in L2.7 polarity tran */ }
            }
        }

        nodesSet.remove("0");
        for (String node : nodesSet) {
            sb.append("R_GND_").append(node)
                    .append(" ").append(node).append(" 0 1e12\n");
        }

        appendModels(sb);
        sb.append(".model SW_BTN SW(Ron=1e-5 Roff=1e12 Vt=2.5 Vh=-0.5)\n");
        sb.append(".options savecurrents\n");

        sb.append("* ICs from prior polarity (skip PWL/voltage-driven nodes)\n");
        for (String node : nodesSet) {
            if (node.startsWith("ctrl_") || drivenNodes.contains(node)) {
                continue;
            }
            double v = nodeVoltage(priorNodes, node);
            sb.append(String.format(Locale.US, ".ic v(%s)=%.6f\n", node, v));
        }

        sb.append("\n.control\n");
        sb.append(String.format(Locale.US, "tran %.6f %.6f uic\n",
                scenario.step(), scenario.stop()));
        sb.append("wrdata tran_out.txt");
        for (TranProbe probe : probes) {
            sb.append(" ").append(probe.wrdataExpression());
        }
        sb.append("\nquit\n.endc\n.end\n");

        return new TranSpiceBuild(sb.toString(), probes, scenario);
    }

    /**
     * Drive SPDT common from prior rail voltage to the new rail with a slow ramp
     * so parallel-cap LED brightness tracks recharge (quiz crossfade).
     */
    private static void appendPolarityPwlDrive(
            StringBuilder sb,
            String id,
            List<String> nodes,
            Map<String, Double> priorNodes,
            boolean toRight,
            double stop) {
        String common = nodes.get(0);
        String left = nodes.get(1);
        String right = nodes.get(2);
        double vPrior = nodeVoltage(priorNodes, common);
        double vNew = toRight
                ? nodeVoltage(priorNodes, right)
                : nodeVoltage(priorNodes, left);
        // Hold prior briefly, ramp through 0 (old LED fades), then to new rail (new LED rises).
        // ~2 s active window — frontend plays that window in ~2–2.5 s wall time.
        double vMid = 0.0;
        sb.append("V_pol_").append(id).append(" ").append(common).append(" 0 ");
        sb.append(String.format(Locale.US,
                "PWL(0 %.6f 0.050000 %.6f 1.000000 %.6f 2.000000 %.6f %.6f %.6f)\n",
                vPrior, vPrior, vMid, vNew, stop, vNew));
    }

    /**
     * Capacitor charge transient: switches closed, initial node voltages from prior idle DC.
     */
    public static TranSpiceBuild generateChargeTranSpice(
            String json,
            Map<String, Double> nodeVoltages,
            TranScenario scenario) throws Exception {
        TranSpiceBuild build = generateTranSpice(json, scenario);
        String icBlock = buildInitialConditions(json, nodeVoltages);
        String netlist = build.netlist().replace(
                "\n.control\n",
                icBlock + "\n.control\n");
        return new TranSpiceBuild(netlist, build.probes(), scenario);
    }

    /**
     * Capacitor discharge transient: switches open, initial node voltages from a prior DC charge.
     */
    public static TranSpiceBuild generateDischargeTranSpice(
            String json,
            Map<String, Double> nodeVoltages,
            TranScenario scenario) throws Exception {
        TranSpiceBuild build = generateTranSpice(json, scenario);
        String icBlock = buildInitialConditions(json, nodeVoltages);
        String netlist = build.netlist().replace(
                "\n.control\n",
                icBlock + "\n.control\n");
        return new TranSpiceBuild(netlist, build.probes(), scenario);
    }

    @SuppressWarnings("unchecked")
    private static String buildInitialConditions(String json, Map<String, Double> nodeVoltages)
            throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        Set<String> nodes = new LinkedHashSet<>();
        for (Map<String, Object> comp : components) {
            List<String> compNodes = (List<String>) comp.get("nodes");
            if (compNodes != null) {
                nodes.addAll(compNodes);
            }
        }
        nodes.remove("0");

        StringBuilder sb = new StringBuilder();
        sb.append("* initial conditions from prior DC state\n");
        for (String node : nodes) {
            if (node.startsWith("ctrl_")) {
                continue;
            }
            double v = nodeVoltage(nodeVoltages, node);
            sb.append(String.format(Locale.US, ".ic v(%s)=%.6f\n", node, v));
        }

        return sb.toString();
    }

    private static double nodeVoltage(Map<String, Double> nodeVoltages, String node) {
        if ("0".equals(node)) {
            return 0.0;
        }
        return nodeVoltages.getOrDefault("v(" + node.toLowerCase() + ")",
                nodeVoltages.getOrDefault("v(" + node + ")", 0.0));
    }

    private static void appendTranSwitch(
            StringBuilder sb,
            Set<String> nodesSet,
            String id,
            String role,
            List<String> nodes,
            TranScenario scenario,
            String switchState) {
        String ctrlNode = "ctrl_" + id.replaceAll("[^a-zA-Z0-9_]", "_");
        nodesSet.add(ctrlNode);

        sb.append("Vctrl_").append(id).append(" ")
                .append(ctrlNode).append(" 0 ");

        if (scenario.pulsesRole(role)) {
            sb.append(String.format(Locale.US,
                    "PWL(0 0 %.6f 0 %.6f 6 %.6f 6 %.6f 0 %.6f 0)\n",
                    scenario.pressStart(),
                    scenario.pressStart(),
                    scenario.pressEnd(),
                    scenario.pressEnd() + 1e-6,
                    scenario.stop()));
        } else if ("switch".equals(role)) {
            // CP.L2.5 master SPST — follow JSON state; do not force closed on idle/charge/discharge.
            if ("closed".equals(switchState)) {
                sb.append(String.format(Locale.US, "PWL(0 6 %.6f 6)\n", scenario.stop()));
            } else {
                sb.append(String.format(Locale.US, "PWL(0 0 %.6f 0)\n", scenario.stop()));
            }
        } else if (scenario.switchTimeline() == TranScenario.SwitchTimeline.CLOSED) {
            sb.append(String.format(Locale.US, "PWL(0 6 %.6f 6)\n", scenario.stop()));
        } else {
            sb.append(String.format(Locale.US, "PWL(0 0 %.6f 0)\n", scenario.stop()));
        }

        sb.append("S_").append(id).append(" ")
                .append(nodes.get(0)).append(" ")
                .append(nodes.get(1)).append(" ")
                .append(ctrlNode).append(" 0 SW_BTN\n");
    }

    private static String voltageExpression(List<String> nodes) {
        String n1 = nodes.get(0);
        String n2 = nodes.get(1);
        if ("0".equals(n2)) {
            return "v(" + n1 + ")";
        }
        if ("0".equals(n1)) {
            return "v(" + n2 + ")";
        }
        return "v(" + n1 + "," + n2 + ")";
    }

    private static String ledModelForColor(String color) {
        if (color == null || color.equals("plain")) {
            return "DIODE_MODEL";
        }
        return switch (color) {
            case "green" -> "LEDMODEL_GREEN";
            case "blue" -> "LEDMODEL_BLUE";
            default -> "LEDMODEL_RED";
        };
    }

    private static void appendSlideSwitch(
            StringBuilder sb, String id, List<String> nodes, Map<String, Object> comp) {
        String slideState = (String) comp.get("state");
        String common = nodes.get(0);
        String left = nodes.get(1);
        String right = nodes.get(2);

        if ("left".equals(slideState)) {
            sb.append("R_").append(id).append("_L ")
                    .append(common).append(" ").append(left).append(" 0.00001\n");
            sb.append("R_").append(id).append("_R ")
                    .append(common).append(" ").append(right).append(" 1e12\n");
        } else {
            sb.append("R_").append(id).append("_L ")
                    .append(common).append(" ").append(left).append(" 1e12\n");
            sb.append("R_").append(id).append("_R ")
                    .append(common).append(" ").append(right).append(" 0.00001\n");
        }
    }

    private static void appendVariableResistor(
            StringBuilder sb, String id, List<String> nodes, Map<String, Object> comp) {
        String vrValue = (String) comp.get("value");
        double maxR = Double.parseDouble(vrValue);
        Object posObj = comp.get("position");
        double pos = posObj != null ? Double.parseDouble(posObj.toString()) : 0.5;

        // Kit pot end-stop / protective floor (~50 Ω).
        double r1 = Math.max(maxR * pos, 50);
        double r2 = Math.max(maxR * (1.0 - pos), 50);

        String wiper = nodes.get(0);
        String left = nodes.get(1);
        String right = nodes.get(2);

        sb.append("R_").append(id).append("_L ")
                .append(wiper).append(" ").append(left).append(" ").append(r1).append("\n");
        sb.append("R_").append(id).append("_R ")
                .append(wiper).append(" ").append(right).append(" ").append(r2).append("\n");
    }

    private static void appendTransistor(
            StringBuilder sb, String id, List<String> nodes, Map<String, Object> comp) {
        String subtype = (String) comp.get("subtype");
        String model = switch (subtype != null ? subtype : "") {
            case "npn" -> "NPN_MODEL";
            case "npn_darlington" -> "NPN_DARLINGTON";
            case "pnp" -> "PNP_MODEL";
            case "pnp_darlington" -> "PNP_DARLINGTON";
            default -> "NPN_MODEL";
        };
        sb.append("Q_").append(id).append(" ")
                .append(nodes.get(1)).append(" ")
                .append(nodes.get(0)).append(" ")
                .append(nodes.get(2)).append(" ")
                .append(model).append("\n");
    }

    private static void appendModels(StringBuilder sb) {
        // Slightly soft Si diode (~0.25–0.35 V at mA) so a parallel LED+2×diode
        // branch can still glow dimly when a bare LED clamps the shared node —
        // matching the Snap-Circuits-style DI.L1.4 demo. Keep enough drop for
        // DI.L1.1 / DI.L2.2 lamp dimming.
        sb.append(".model DIODE_MODEL    D (IS=3e-7 N=1.12 RS=2  BV=100)\n");
        // Extra RS softens the Vf clamp so parallel unequal-LED demos share current.
        sb.append(".model LEDMODEL_RED   D (IS=9e-21 N=1.9  RS=55 BV=20)\n");
        sb.append(".model LEDMODEL_GREEN D (IS=2e-21 N=2.0  RS=3  BV=20)\n");
        sb.append(".model LEDMODEL_BLUE  D (IS=5e-22 N=2.2  RS=4  BV=20)\n");
        sb.append(".model NPN_MODEL NPN (IS=1e-14 BF=150 VAF=100 IKF=0.3 RC=0.1)\n");
        sb.append(".model PNP_MODEL PNP (IS=1e-14 BF=150 VAF=100 IKF=0.3 RC=0.1)\n");
        sb.append(".model NPN_DARLINGTON NPN (IS=1e-14 BF=5000 VAF=100 IKF=0.3 RC=0.1)\n");
        sb.append(".model PNP_DARLINGTON PNP (IS=1e-14 BF=5000 VAF=100 IKF=0.3 RC=0.1)\n");
    }

    public static String setSwitchState(String json, String state) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        for (Map<String, Object> comp : components) {
            if ("switch".equals(comp.get("type"))) {
                comp.put("state", state);
            }
        }

        return mapper.writeValueAsString(data);
    }

    /** Set every slide_switch component to the same throw (left/right). */
    public static String applyAllSlideStates(String json, String state) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        for (Map<String, Object> comp : components) {
            if ("slide_switch".equals(comp.get("type"))) {
                comp.put("state", state);
            }
        }

        return mapper.writeValueAsString(data);
    }

    /** Set switch / slide_switch state per logical role (e.g. button → open). */
    public static String applySwitchStates(String json, Map<String, String> statesByRole)
            throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        for (Map<String, Object> comp : components) {
            String role = (String) comp.get("role");
            if (role == null || !statesByRole.containsKey(role)) {
                continue;
            }
            String type = (String) comp.get("type");
            if ("switch".equals(type) || "slide_switch".equals(type) || "motor".equals(type)) {
                comp.put("state", statesByRole.get(role));
            }
        }

        return mapper.writeValueAsString(data);
    }

    /** Set potentiometer wiper position (0..1) per logical role. */
    public static String applyPotPositions(String json, Map<String, Double> positionsByRole)
            throws Exception {
        if (positionsByRole == null || positionsByRole.isEmpty()) {
            return json;
        }
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        for (Map<String, Object> comp : components) {
            if (!"variable_resistor".equals(comp.get("type"))) {
                continue;
            }
            String role = (String) comp.get("role");
            if (role == null || !positionsByRole.containsKey(role)) {
                continue;
            }
            double pos = positionsByRole.get(role);
            if (pos < 0) {
                pos = 0;
            } else if (pos > 1) {
                pos = 1;
            }
            comp.put("position", pos);
        }

        return mapper.writeValueAsString(data);
    }

    /** Flip every pot wiper to {@code 1 - position} (bright ↔ dim extreme). */
    @SuppressWarnings("unchecked")
    public static String invertAllPotPositions(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");
        if (components == null) {
            return json;
        }
        for (Map<String, Object> comp : components) {
            if (!"variable_resistor".equals(comp.get("type"))) {
                continue;
            }
            Object posObj = comp.get("position");
            double pos = posObj != null ? Double.parseDouble(posObj.toString()) : 0.5;
            if (pos < 0) {
                pos = 0;
            } else if (pos > 1) {
                pos = 1;
            }
            comp.put("position", 1.0 - pos);
        }
        return mapper.writeValueAsString(data);
    }

    /**
     * Effective motor resistance. Default 50 Ω keeps existing DM tasks unchanged.
     * {@code running}/{@code stalled} model back-EMF vs winding R (DM.L2.10 / L3.11).
     * Stalled ≈2 Ω so V_motor drops below green Vf even with a 20 Ω sense resistor
     * (L3.11 green ‖ motor); running stays high so the red sense LED stays off.
     */
    private static String motorResistanceOhms(Map<String, Object> comp) {
        Object state = comp.get("state");
        if ("stalled".equals(state)) {
            return "2";
        }
        if ("running".equals(state)) {
            return "700";
        }
        return "50";
    }
}