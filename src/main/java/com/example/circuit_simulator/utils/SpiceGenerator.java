package com.example.circuit_simulator.utils;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

public class SpiceGenerator {

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

            nodesSet.addAll(nodes);

            switch (type) {
                case "voltage":
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
                            .append(nodes.get(1)).append(" 50\n");
                    break;
                case "slide_switch":

                    String slideState = (String) comp.get("state");

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

                    Object posObj = comp.get("position");
                    double pos = posObj != null ? Double.parseDouble(posObj.toString()) : 0.5;

                    double r1 = maxR * pos;           // wiper to left end
                    double r2 = maxR * (1.0 - pos);   // wiper to right end

                    if (r1 < 1) r1 = 1;
                    if (r2 < 1) r2 = 1;

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
                    sb.append("Q_").append(id).append(" ")
                            .append(nodes.get(1)).append(" ")  // collector
                            .append(nodes.get(0)).append(" ")  // base
                            .append(nodes.get(2)).append(" ")  // emitter
                            .append(model).append("\n");
                    break;
            }
        }

        nodesSet.remove("0");
        for (String node : nodesSet) {
            sb.append("R_GND_").append(node)
                    .append(" ").append(node).append(" 0 1e12\n");
        }

        sb.append(".model DIODE_MODEL    D (IS=1e-10 N=1.0  RS=1  BV=100)\n");
        sb.append(".model LEDMODEL_RED   D (IS=1e-18 N=1.8  RS=5  BV=5)\n");  // Vf ~1.8V
        sb.append(".model LEDMODEL_GREEN D (IS=1e-21 N=2.0  RS=5  BV=5)\n");  // Vf ~2.1V
        sb.append(".model LEDMODEL_BLUE  D (IS=1e-24 N=2.2  RS=5  BV=5)\n");  // Vf ~2.8V
        sb.append(".model NPN_MODEL NPN (IS=1e-14 BF=150 VAF=100 IKF=0.3 RC=0.1)\n");
        sb.append(".model PNP_MODEL PNP (IS=1e-14 BF=150 VAF=100 IKF=0.3 RC=0.1)\n");
        sb.append(".model NPN_DARLINGTON NPN (IS=1e-14 BF=5000 VAF=100 IKF=0.3 RC=0.1)\n");
        sb.append(".model PNP_DARLINGTON PNP (IS=1e-14 BF=5000 VAF=100 IKF=0.3 RC=0.1)\n");
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
}