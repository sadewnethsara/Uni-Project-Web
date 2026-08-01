"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { BackgroundLines } from "./ui/background-lines";
import Link from "next/link";
import RippleBackground from "./effects/RippleBackground";

// --- TYPES ---
interface LocationData {
    id: string;
    name: string;
    stat: string;
    cx: number;
    cy: number;
    color: string;
    items: string[];
    range: [number, number];
    tx: number; // Target X for card
    ty: number; // Target Y for card
    align: 'left' | 'right'; // Which side of the line the card is on
    image: string; // High-quality image for the market slider
}

// --- DATA ---
const locations: LocationData[] = [
    {
        id: "thambuththegama", name: "Thambuththegama", stat: "220 Tons", cx: 350, cy: 240, color: "#059669",
        items: ["Grains", "Banana"], range: [0.30, 0.40], tx: 180, ty: 50, align: 'left',
        image: "https://images.unsplash.com/photo-1573246123716-6b1782bc49ca?auto=format&fit=crop&q=80&w=500" // Bananas/Grains
    },
    {
        id: "veyangoda", name: "Veyangoda Hub", stat: "180 Tons", cx: 295, cy: 395, color: "#34d399",
        items: ["Coconut", "Mango"], range: [0.40, 0.50], tx: 30, ty: 200, align: 'left',
        image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=500" // Coconut/Mango
    },
    {
        id: "meegoda", name: "Meegoda Center", stat: "290 Tons", cx: 290, cy: 440, color: "#10b981",
        items: ["Fruits", "Root Veg"], range: [0.50, 0.60], tx: 170, ty: 350, align: 'left',
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500" // Vegetables market
    },
    {
        id: "manning", name: "Manning Market", stat: "850 Tons", cx: 275, cy: 425, color: "#047857",
        items: ["Fish", "Vegetables"], range: [0.45, 0.55], tx: 0, ty: 500, align: 'left',
        image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=500" // Fresh produce
    },
    {
        id: "dambulla", name: "Dambulla Center", stat: "340 Tons", cx: 385, cy: 290, color: "#10b981",
        items: ["Vegetables", "Fruits"], range: [0.35, 0.45], tx: 680, ty: 120, align: 'right',
        image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=500" // Open market
    },
    {
        id: "keppetipola", name: "Keppetipola Hub", stat: "180 Tons", cx: 410, cy: 380, color: "#059669",
        items: ["Carrot", "Potato"], range: [0.55, 0.65], tx: 650, ty: 310, align: 'right',
        image: "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=500" // Root veggies
    },
    {
        id: "nuwara-eliya", name: "Nuwara Eliya Hub", stat: "150 Tons", cx: 390, cy: 400, color: "#34d399",
        items: ["Tea", "Leeks"], range: [0.60, 0.70], tx: 680, ty: 520, align: 'right',
        image: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=500" // Tea fields
    }
];

const SRI_LANKA_PATH = "M551.018,409.005l0.334,2.184l1.404,4.879l0.223,2.874l-0.78,5.484l-6.307,21.893l-0.357,2.256l-0.134,2.985 l-0.468,2.491l-1.972,3.843l-0.435,1.717l-0.78,2.356l-2.652,4.157l-1.248,1.952l0.936,3.354l-1.504,3.982l-12.892,20.435 l-4.301,4.312l-7.945,5.646l-2.596,0.779l-3.477,1.867l-25.417,20.011l-5.081,2.757l-16.502,5.873h-0.011l-0.223-1.989 l-0.011-0.118l-0.98-0.773l-0.022,0.006l-0.223,0.056l-0.824,0.224l-0.524,1.104l-0.268,2.32l-0.746,0.874l-1.203,0.325 l-1.593,0.706l-2.975,1.799l-2.975,1.311L432.236,546l-6.909,2.376l-7.577,1.378l-3.454,1.333l-2.073,2.925l-3.711-0.728 l-2.284,0.88l-1.292,0.504l-5.271,3.905l-5.271,3.899l-2.429,2.823l-5.605-0.331l-0.011-0.006l-2.34,0.336l-1.827,0.695 l-1.883,1.076l-3.332,2.498l-0.958,0.224L375.051,570l-2.273-0.879l-2.407-1.244l-1.382-0.42l-0.958-0.286l-7.923,0.941 l-2.262-0.443l-1.148-1.137l-0.735-1.496l-0.579-0.874l-0.435-0.661l-2.318,1.356l-2.072,0.157l-3.688-0.532l-0.88-0.129 l-0.657-0.291l-0.457-0.65l-0.579-0.644l-1.07-0.297l-0.635,0.224l-0.501,0.448l-0.535,0.381l-0.713-0.022l-0.245-0.202 l-0.223-0.196l-0.869-1.238l-0.423-0.258l-0.111-0.067v-0.011l-0.969-0.342l-5.85-2.101l-2.396-0.493l-1.705-0.359l-2.975-2.392 l-0.668-0.325l-1.315-0.639l-0.022-0.011l-1.003,1.025l-2.552-2.062l-11.154-11.839l-0.914-0.717l-0.011-0.006l-0.1-0.129 l-0.312-0.375l-0.167-0.583l0.045-1.166l-0.345-0.605l-0.468-0.611l-1.237-1.62l-6.318-13.361l-0.267-1.278v-0.011l0.033-1.143 l0.034-1.143v-0.011l-0.234-0.695l-1.137-2.371l-1.159-6.43l-2.518-4.519l-1.582-6.464l-0.579-2.366l-0.29-0.23l-0.591-0.359 l-0.613-0.538l-0.379-0.757l0.156-0.807l0.669-0.196l0.702,0.078h0.011l0.334-0.017l-1.047-7.228l-0.089-0.578l-2.853-7.335 l-11.733-30.141l-1.861-10.415l-0.178-1.033v-9.923l0.156-0.387l1.359-3.272l0.357-1.572l-0.033-1.6v-0.028l-6.552-23.3l0.903-3.42 l-0.045,2.106l0.513,1.325l0.735,1.022l0.646,1.207l1.315,4.621l0.646,1.112h0.847l0.201-1.319l0.39-0.556l0.345-0.09h0.011 l0.078,0.079l-0.033-4.223v-0.028l-0.301-1.848l-0.691-1.522l-0.646-0.444l-1.805-0.393l-0.802-0.539l-0.089-0.191l-0.49-0.994 l0.223-1.095l0.524-1.022l0.279-0.977l-6.73-49.29l-0.836-1.787l0.568-0.607l0.423-0.062l0.981,0.669l0.223-2.389l0.68-2.771 l0.167-1.327l0.167-1.332l-0.769-2.08l-1.036-1.906l-0.201-1.265l-0.201-1.265l0.011-5.094l-3.153-15.493l-0.368-1.788 l-1.627-3.403l-1.382-7.149l-2.24-5.642l-3.443-15.592v-4.429l0.557,0.253l0.033,0.039l0.045,0.039v0.141l0.301,0.473l0.49-2.572 l-0.724-8.173l-0.702-2.477l2.251-1.486l2.128-2.753l1.538-3.136l0.613-2.635l0.624-1.723l4.045-6.391l-0.045,0.107l-2.039,4.826 l-2.585,4.6l0.568,1.12l0.145,0.276l1.014,1.013l1.326,0.529l1.616-0.011l-1.326,3.76l-1.382,2.758l-0.602,0.478l-0.635,0.068 l-0.501,0.388l-0.223,1.469l0.123,3.27l-0.123,1.019l-2.318,7.412l0.089,1.373l0.178,2.746l2.396,2.853l0.68,0.81l-2.741,5.739 l4.368,3.179l6.351,0.501l3.231-2.29l-0.613-2.464l-1.036-1.93l-0.401-0.737l-0.49-0.608l-1.215-1.53l-1.371-0.878l-0.401-1.497 l4.613-8.813l-0.178-1.598l-0.591-1.182l-0.68-0.991l-0.423-1.036l-0.112-1.666l0.156-2.871l-0.044-1.182v-0.034l-0.078-0.225 l-0.368-0.985l-0.223-0.203l-0.267-0.253l-0.267-0.563l0.267-1.548l0.646-1.312l1.794-2.353l0.368-1.531l0.29-2.894l1.281-5.794 l1.304-13.516l0.836-1.538l0.903-0.76l0.691-0.918l0.29-2.022v-5.763l0.791-2.828l1.861-1.82l2.206-1.504l1.783-1.927l0.223-0.682 l1.359-4.237l0.189-0.18l0.1-0.096l0.301-1.24l1.27-2.773l1.215-13.482l-3.298-8.603l0.267-1.494l0.245-9.811v-0.135l-0.334-3.276 l-0.401-1.613l-0.713-1.218l-0.557-1.387l1.27-0.688l1.839-0.344l1.215-0.372l7.945-7.192l4.145-2.048l1.727-1.517l0.914-3.374 l1.638-3.47l0.936-4.824l4.401-11.433l0.156-0.632l0.412-1.671l0.847-3.381v-8.061l0.301-1.18l-0.267-0.796l-1.604-0.311 l-3.777-1.976l-1.471-1.378l-0.925-2.609l-0.156-0.474l-0.658-3.252l-0.067-1.847l1.638-1.734l3.031-1.519l3.365-1.079l2.763-0.412 l1.237-0.638l3.008-4.01l0.346-0.26l0.524-0.407l1.003-0.599l1.237-0.463l1.571-0.249l-1.304-2.418l-0.78-1.062l-0.791-1.062 l-2.017-2l-2.663-2l-10.129-5.978l-2.039-2.548l4.413,0.141L310,64.219l8.246,4.814l7.867,1.989l2.073,1.333l3.242,2.847 l0.802,1.508l-1.671,0.853l0.368,0.949l0.49,0.949l-0.858,0.938l0.011,0.006l2.864,1.937l6.764-1.661l12.368-4.931l3.332,0.322 l7.298,2.022l8.613,3.897l6.496,1.254h0.022l-9.315-6.417l-3.209-1.491l-2.853-0.621l-0.423-0.198l-0.412-0.198l-2.474-1.887 l-0.936-0.554l-0.936-0.147l-1.125,0.057l-1.694,0.09l-1.07,0.412l-0.156,0.237l-0.301,0.503l-0.535,0.277l-1.816-1.35 l-0.724-0.124l-4.446,0.119l-1.27-0.373l-9.739-8.475l-4.178-2.718h-0.011l-1.493-0.661l-7.042-3.097l-2.541-1.475l-1.705-0.023 l0.323,3.379l0.947,0.994l1.471,1.125l0.869,1.373l-0.869,1.774l-1.036,0.316l-1.003-0.542l-0.914-0.768l-2.63-1.373l-5.115-4.481 l-2.942-1.266l0.011,0.011l1.493,1.65l2.697,2.34l1.493,1.695l-3.32-0.644l-3.276-1.373l-6.585-3.679l-5.248-4.148l-3.12-1.108 l-0.312-0.192l-1.181-0.769L288.572,49l-0.167,0.984l-1.504-1.034l-0.568-1.34l-0.267-1.6l-0.535-1.809l-0.903-1.543l-0.535-0.701 l-1.404-1.843l-0.903-1.6l2.964-1.493l5.393-5.015l2.429-1.086h0.011l10.697,0.95l5.582-0.628l2.039,0.237l0.802,1.855 l-0.134,2.912l0.401,1.012l1.17,0.384l1.137,0.164l3.276,0.848l0.691,0.373l0.613,1.221l1.471-0.051l1.159-0.356l0.446-0.136 l0.669-0.096l0.468-0.068l0.011,0.006l1.059,0.622l0.457,0.266l3.833,4.195l12.079,13.203l4.257,2.69l9.872,4.577l0.312,0.136 v-1.028l-4.97-2.526l-12.034-9.895l-9.861-11.435l-5.014-2.708l-7.856-1.866l-2.073-1.493l-0.267-2.109l2.875-1.255l0.936-0.158 l2.853-0.481L325.21,30l2.73,0.514l1.894,1.34l1.259,4.546l1.259,1.9l17.929,21.161l2.641,1.95l5.348,3.068l37.807,30.772 l0.145,0.248l0.958,1.615l1.538,1.92l2.942,2.778l1.872,2.433l-1.66,0.875l-0.011,0.006l-0.936-0.423l-0.112-0.051l-0.022-0.006 l-1.437-1.863l-0.791-0.407l-0.011-0.011l-2.474-0.407l-1.081,0.327l0.535,1.106l0.178,0.35l7.109,6.65l2.775,1.53l0.011,0.006 l-1.103-1.722l-0.669-1.575l0.345-1.163l1.894-0.446l0.891,0.604l1.449,4.301l1.326,2.647l5.204,10.435l-1.048-0.389l-2.897-1.078 l-1.816-0.034l-0.769,1.975l1.07,0.502l2.229,0.367l1.983,1.253l0.022,0.169l0.29,3.002h0.022h0.914l0.457-0.796l0.412-0.344 l0.468-0.226l0.624-0.44v0.011l0.702,2.754l0.078,0.344l1.939,4.44l2.596,3.983l2.641,1.726l0.201,0.163l0.312,0.265l-0.011,0.97 l-0.635,0.976l-1.27,0.457l-0.368-0.406l-1.504-2.426l-1.638-0.869l-3.755-0.97l-2.184-1.004l1.003,1.399l0.557,0.778l4.947,4.648 l0.045,2.64l1.627,1.151l-0.011,0.011l-1.46,1.359l-1.292,1.54l0.011,0.006l2.151,1.698l2.318-0.18l1.894-1.777l1.404-2.47 l0.914-2.284l0.022,0.011l4.947,5.995l4.39,7.562l1.794,1.872l2.507,0.733l2.006,1.624l2.942,7.155l0.746,0.784l0.791,0.84 l0.011,0.006l3.365,1.533l1.683,3.602l1.928,7.243l0.345-1.33l0.446-0.519l0.747,0.169l0.011,0.006l1.326,0.727l-0.401,1.33 l3.811,4.171l1.27,2.068l-0.011,2.497l-1.003,1.003l-1.426,0.659l-1.304,1.516l0.022-0.011l0.992-0.254l1.025-0.265l0.256-0.141 l0.512-0.276l0.011,0.011l2.964,6.469l0.435,3.369l-3.399,0.552h-0.011l0.702-2.231l-0.914-1.792l-1.515-0.254l-1.081,2.383 l0.368,1.848l0.969,1.313l0.535,1.403l-1.014,2.135l-0.802-0.614l-1.493-1.166l-2.373-1.47l-2.396-0.552l-2.284,0.969l-1.772,2.389 l0.624,1.251l2.117-0.327l2.853-2.361l1.961,2.09l1.772,2.507l2.139,2.09l3.009,0.867l6.296-0.124l2.128-1.352l-1.404-3.245 l3.599-1.651l1.426-0.439l1.515,0.107l0.011,0.011l1.66,0.958l1.515,1.622l1.137,1.893l0.969,5.543l2.139,7.13l0.067,1.858 l0.067,1.864l-1.738-1.222l-1.816-3.672l-1.593-0.777l-0.056,1.003l0.658,4.494l0.056,0.343l0.746,1.723l0.914,0.434l0.836,0.394 h0.022h1.85l1.471,0.664l0.869,5.293l1.048,3.671l0.178,0.608l0.29,2.246v0.011l0.423,1.436l2.853,9.665l1.081,6.298L490,269.322 v0.017l-1.382-5.701l-0.201-0.805l-2.084-5.775h-1.003l-0.167,4.385l0.167,1.379l-0.1-0.045l-0.1,0.394v0.011v0.687l0.201,0.833 l0.457,0.54l1.159,0.354l0.011,0.006l0.234,0.433l1.114,2.898l2.407,1.767h0.011l2.295-0.191l0.802-2.971h0.836l0.869,1.587 l0.234,0.428l1.125,4.991l1.148,1.919l1.526,1.677l0.981,1.632l1.694,3.905l0.669-0.675l0.88-0.664l0.401-0.636l0.602,1.288 l-0.602,0.686l0.301,0.495l0.267,0.326l0.045,0.084l0.156,0.276l0.089,0.619l0.011-0.011l0.68-0.563l1.404-0.675l0.713-0.551v0.011 l0.323,0.776l0.39,0.945l-0.29,1.12l-0.479,1.114l0.022,0.861l0.034,0.833l0.958,1.856l1.694,1.299l1.103,0.849l1.003,1.659 l-0.635,0.039l-0.323,0.219l-0.412,0.281l-0.256,0.163l-0.256,0.158l-0.401,1.508l-0.401,1.507l1.605,4.713l0.869,1.001 l1.961,2.261h0.022l2.897-0.529h0.936l0.947,2.885l1.081,1.783l0.334,0.551l5.906,6.185l1.905,3.019l0.334,2.671l-3.031,0.917 l-0.011,0.006l-1.404-0.956l-3.365-4.29l-1.76-1.524l-2.273-0.838h-0.022l-0.234,0.023l-1.616,0.141l-1.426,1.462l-0.97,3.064 l1.638,0.748l1.582,0.225l1.359-0.506l1.025-1.411l1.616,0.607l1.482,0.742l0.512,0.607l0.345,0.427l-0.212,1.479l1.816,1.704 l1.816,1.703l1.426,1.642l1.493,2.496l-0.011,0.006l-0.702,0.815l-0.178,0.793l0.234,0.95l0.657,1.304l0.847-1.04l-0.513-1.878 v-0.011l1.616,0.573l3.176,2.355l0.758,1.102l2.518,6.436l-0.156,0.275l-0.78,3.496l0.111,0.382l0.022,0.056l0.646,1.337 l0.156,0.539l-0.535,0.95l-0.981,0.759l-0.59,0.843l0.702,1.225l0.669,0.882l0.234,0.691l0.033,0.09l0.401,0.787l1.003,0.893 l-1.471,1.068l0.134,0.523l0.134,0.534l1.103,0.23l1.103-1.416h0.847l0.011,0.006l1.047,5.568l-0.033,2.051h0.022h0.936v-0.051 l0.111-1.933l0.334-1.91l0.579-1.63l0.847-1.158v-0.944l-0.078-0.214l-0.301-0.865l0.245-0.433l0.758,0.32l1.226,1.191l0.424,1.09 l0.312,2.927l2.106,3.354l3.421,11.747L551.018,409.005z";

// --- CAROUSEL IMAGES PER LOCATION ---
const CAROUSEL_IMAGES: Record<string, string[]> = {
    thambuththegama: [
        "https://images.unsplash.com/photo-1573246123716-6b1782bc49ca?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
    ],
    veyangoda: [
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
    ],
    meegoda: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1573246123716-6b1782bc49ca?auto=format&fit=crop&q=80&w=800",
    ],
    manning: [
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800",
    ],
    dambulla: [
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    ],
    keppetipola: [
        "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=800",
    ],
    "nuwara-eliya": [
        "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=800",
    ],
};

// Agri theme colours (from ANALYZE_THEME)
const T = {
    page: "#f7efe3",
    surface: "#fff8ee",
    surfaceMuted: "#f0e6d8",
    surfaceDeep: "#e8dccb",
    border: "rgba(61,48,36,0.10)",
    borderStrong: "rgba(61,48,36,0.18)",
    ink: "#2a2118",
    inkMuted: "#7a6a58",
    inkFaint: "#a89886",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    accentInk: "#115e59",
    up: "#0d9488",
};

// --- BOTTOM SHEET COMPONENT ---
function MarketBottomSheet({ loc, onClose }: { loc: LocationData | null; onClose: () => void }) {
    const [slide, setSlide] = useState(0);
    const images = loc ? (CAROUSEL_IMAGES[loc.id] ?? [loc.image]) : [];

    // Reset slide when location changes
    React.useEffect(() => { setSlide(0); }, [loc?.id]);

    return (
        <>
            {/* Backdrop */}
            {loc && (
                <motion.div
                    className="fixed inset-0 z-[60] bg-black/25"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />
            )}

            {/* Sheet */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 z-[70] w-full lg:left-1/2 lg:-translate-x-1/2 lg:w-[50vw] rounded-t-[28px] overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.22)]"
                initial={{ y: '100vh' }}
                animate={{ y: loc ? '0vh' : '100vh' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                style={{ background: T.page }}
            >
                {loc && (
                    <div>
                        {/* ── Drag handle ── */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full" style={{ background: T.borderStrong }} />
                        </div>

                        {/* ── Carousel ── */}
                        <div className="relative h-52 mx-4 rounded-2xl overflow-hidden"
                            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={slide}
                                    src={images[slide]}
                                    alt={`${loc.name} ${slide + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    initial={{ opacity: 0, scale: 1.04 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.38, ease: 'easeInOut' }}
                                />
                            </AnimatePresence>

                            {/* gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                            {/* close */}
                            <button onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                                style={{ background: 'rgba(0,0,0,0.45)' }}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* arrow prev */}
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                                        style={{ background: 'rgba(0,0,0,0.40)' }}>
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button onClick={() => setSlide((s) => (s + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                                        style={{ background: 'rgba(0,0,0,0.40)' }}>
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* dot indicators */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                    {images.map((_, i) => (
                                        <div key={i} className="rounded-full transition-all duration-300"
                                            style={{ width: i === slide ? 18 : 6, height: 6, background: i === slide ? '#fff' : 'rgba(255,255,255,0.45)' }} />
                                    ))}
                                </div>
                            )}

                            {/* name overlay */}
                            <div className="absolute bottom-5 left-4">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-2 h-2 rounded-full" style={{ background: loc.color }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.65)' }}>Agricultural Hub</span>
                                </div>
                                <h2 className="text-[22px] font-black text-white leading-tight tracking-tight">{loc.name}</h2>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="px-4 pt-4 pb-6 space-y-4">

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Vol. / Day', value: loc.stat },
                                    { label: 'Commodities', value: String(loc.items.length) },
                                    { label: 'Status', value: 'Active' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-xl px-3 py-3 border"
                                        style={{ background: T.surface, borderColor: T.border }}>
                                        <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: T.inkFaint }}>{label}</p>
                                        <p className="text-base font-black" style={{ color: label === 'Vol. / Day' ? loc.color : T.ink }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="border-t" style={{ borderColor: T.border }} />

                            {/* Commodities */}
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: T.inkFaint }}>Key Commodities</p>
                                <div className="flex flex-wrap gap-2">
                                    {loc.items.map(item => (
                                        <span key={item}
                                            className="px-3 py-1.5 rounded-full text-[11px] font-bold border"
                                            style={{ color: loc.color, borderColor: loc.color + '50', background: loc.color + '12' }}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Info paragraph */}
                            <p className="text-[12px] leading-relaxed" style={{ color: T.inkMuted }}>
                                {loc.name} is a key agricultural distribution hub in Sri Lanka, facilitating wholesale trade for regional farmers and buyers. Real-time price analytics are available on the market page.
                            </p>

                            {/* CTA */}
                            <Link
                                href={`/market/${loc.id}`}
                                onClick={onClose}
                                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest text-white transition-all active:scale-[0.98] hover:brightness-110"
                                style={{ background: `linear-gradient(135deg, ${loc.color}, ${T.accent})`, boxShadow: `0 4px 20px ${loc.color}55` }}
                            >
                                View {loc.name} Market
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}

export default function CombinedScrollytellingHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedLoc, setSelectedLoc] = useState<LocationData | null>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // 1. Intro Title (0% -> 15%)
    const introDisplay = useTransform(
        scrollYProgress,
        [0, 0.15],
        ["flex", "none"]
    );
    const introOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
    const introScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
    const introPointer = useTransform(scrollYProgress, [0, 0.15], ["auto", "none"]);

    // 1.5 Floating Cards (0% -> 15%)
    const cardsOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
    const cardsY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

    // 2. Map Base Drawing (15% -> 30%)
    const mapOpacity = useTransform(
        scrollYProgress,
        [0.18, 0.25, 0.95, 1],
        [0, 1, 1, 0]
    );

    // Sea Ripple Background Reveal (from bottom)
    const rippleY = useTransform(scrollYProgress, [0.12, 0.22], ["100vh", "0vh"]);
    const initialBgOpacity = useTransform(scrollYProgress, [0.12, 0.18], [1, 0]);
    const initialBgDisplay = useTransform(scrollYProgress, [0.12, 0.18], ["block", "none"]);

    // The glowing outline takes its time to draw fully (15% to 30%)
    const outlinePathLength = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);

    // 2.5 Mid-Scroll Initialization Panels (15% -> 35%)
    const initOpacity = useTransform(scrollYProgress, [0.15, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
    const initScale = useTransform(scrollYProgress, [0.15, 0.4], [0.95, 1.05]);
    const initY = useTransform(scrollYProgress, [0.1, 0.4], [100, -100]);

    // NEW TIMING: The base map fill fades in VERY EARLY (12% to 18%) 
    // so the user knows it's a map even before the line finishes tracing it.
    const baseMapOpacity = useTransform(scrollYProgress, [0.12, 0.18], [0, 1]);

    // 3. Map Shift & Analytics Panel (Delayed to 85% instead of 75%)
    const mapX = useTransform(scrollYProgress, [0.86, 0.92], ["0%", "-25%"]);
    const mapY = useTransform(scrollYProgress, [0.86, 0.92], ["0%", "0%"]); // Shifts map upwards to clear the image slider
    const mapScale = useTransform(scrollYProgress, [0.86, 0.92], [1, 0.9]);
    const panelOpacity = useTransform(scrollYProgress, [0.86, 0.92, 0.98, 1], [0, 1, 1, 0]);
    const panelX = useTransform(scrollYProgress, [0.86, 0.92], [100, 0]);

    // 4. Image Slider fades in concurrently with the analytics panel at the bottom
    const sliderY = useTransform(scrollYProgress, [0.86, 0.92], [100, 0]);

    // Water effect opacity - only during map section, fades out before analytics panel
    const waterOpacity = useTransform(scrollYProgress, [0.12, 0.22, 0.75, 0.85], [0, 1, 1, 0]);

    return (
        <div ref={containerRef} className="relative text-slate-900">


            {/* BACKGROUND DECORATION (FADES OUT) */}
            <motion.div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ opacity: initialBgOpacity, display: initialBgDisplay as any }}>
                <BackgroundLines children={undefined}></BackgroundLines>

                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '50px 50px' }}
                />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-50/30 rounded-full blur-[150px]" />
            </motion.div>

            {/* MAIN STICKY VIEWPORT */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-10 pointer-events-none">

                {/* SECTION 1: INTRO TITLE */}
                <motion.div
                    style={{ opacity: introOpacity, scale: introScale, pointerEvents: introPointer as any, display: introDisplay }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-50 w-full max-w-7xl mx-auto"
                >
                    {/* Floating Cards to fill empty space */}
                    <motion.div
                        style={{ opacity: cardsOpacity, y: cardsY }}
                        className="absolute inset-0 pointer-events-none hidden lg:block"
                    >
                        {/* Card 1: Top Left */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute top-[20%] left-[5%] bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">🥕</div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keppetipola</p>
                                <p className="text-sm font-black text-slate-900">Carrot - Rs. 240/kg</p>
                                <p className="text-xs font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    -12% today
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 2: Bottom Right */}
                        <motion.div
                            animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-[30%] right-[3%] bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center gap-4"
                        >
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prediction</p>
                                <p className="text-sm font-black text-slate-900">Tomato Trend</p>
                                <p className="text-xs font-bold text-rose-500 mt-0.5 flex items-center justify-end gap-1">
                                    Expected +15%
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl">🍅</div>
                        </motion.div>

                        {/* Card 3: Top Right */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
                            className="absolute top-[18%] right-[8%] bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col items-start gap-2"
                        >
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Compare</p>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-600">Dambulla</p>
                                    <p className="text-sm font-black text-slate-900">450/kg</p>
                                </div>
                                <div className="w-px bg-slate-200" />
                                <div>
                                    <p className="text-xs font-bold text-slate-600">Colombo</p>
                                    <p className="text-sm font-black text-slate-900">520/kg</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50/80 backdrop-blur-md border border-emerald-200/50 text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] mb-10 shadow-sm"
                    >
                        Sri Lanka's #1 Agri-Market Platform
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="text-[4rem] md:text-[7rem] lg:text-[8rem] font-black tracking-tighter text-slate-900 leading-[0.9]"
                    >
                        Market <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                            Intelligence.
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-8 max-w-2xl text-lg md:text-xl text-slate-500 font-medium leading-relaxed"
                    >
                        Track daily vegetable prices, compare regional economic centers, and predict future trends with AI-driven analytics. Designed for farmers, traders, and everyday consumers.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-16 flex flex-col items-center gap-4"
                    >
                        <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-slate-400">Scroll to Explore</span>
                        <div className="w-[1px] h-16 bg-gradient-to-b from-emerald-300 to-transparent" />
                    </motion.div>
                </motion.div>

                {/* MASSIVE SCROLLING BACKGROUND TEXT (15% -> 35%) */}
                <motion.div
                    style={{ opacity: initOpacity, y: initY }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
                >
                    <h2 className="text-[10rem] md:text-[18rem] whitespace-nowrap font-black text-slate-100/50 tracking-tighter select-none">
                        MARKET DATA
                    </h2>
                </motion.div>

                {/* MID-SCROLL SCANNING PANELS (Fills empty space 15%-35%) */}
                <motion.div
                    style={{ opacity: initOpacity, scale: initScale }}
                    className="absolute inset-0 flex items-center justify-between px-4 md:px-10 pointer-events-none w-full max-w-7xl mx-auto z-10 hidden md:flex"
                >
                    {/* Left Panel */}
                    <div className="w-64 bg-white/60 backdrop-blur-3xl border border-white/50 p-6 rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)]">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="w-5 h-5 border-[3px] border-emerald-500 border-t-transparent rounded-full"
                            />
                        </div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Connecting Hubs</h4>
                        <p className="text-[10px] text-slate-500 font-bold mb-4 leading-relaxed">Initializing secure data link to provincial economic centers...</p>
                        <div className="space-y-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div key={i} className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                                    <motion.div
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3, ease: "easeInOut" }}
                                        className="h-full bg-emerald-400 w-1/2 rounded-full"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="w-64 bg-white/60 backdrop-blur-3xl border border-white/50 p-6 rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] text-right flex flex-col items-end">
                        <motion.h4
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-4xl font-black text-slate-900 leading-none"
                        >
                            Live
                        </motion.h4>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Data Stream Active</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-4 leading-relaxed line-clamp-3">
                            Cross-referencing historical market data. Preparing algorithmic price predictions based on supply metrics...
                        </p>
                        <div className="mt-4 flex gap-1 items-end h-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: ["20%", "100%", "20%"] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1, ease: "easeInOut" }}
                                    className="w-1.5 bg-emerald-300 rounded-t-sm"
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* THE INTERACTIVE INTERFACE (MAP + SVG CARDS) */}
                <div className="relative w-full h-full max-w-[100rem] mx-auto flex items-center justify-center px-4 md:px-10 mt-10 md:mt-0">

                    {/* CENTER MAP & SVG CARDS */}
                    <motion.div
                        style={{ opacity: mapOpacity, x: mapX, y: mapY, scale: mapScale }}
                        className="relative z-30 w-full h-screen max-h-[900px] flex items-center justify-center pointer-events-auto"
                    >
                        {/* WATER EFFECT - Only within map section */}
                        <motion.div
                            className="absolute inset-0 overflow-hidden"
                            style={{ opacity: waterOpacity }}
                        >
                            <RippleBackground elements={[
                                {
                                    type: 'text',
                                    content: 'SRI LANKA',
                                    fontFamily: 'Montserrat, system-ui, sans-serif',
                                    fontWeight: '900',
                                    fontSize: 220,
                                    color: 'rgba(255, 255, 255, 0.22)',
                                    x: 0.5,
                                    y: 0.38,
                                }
                            ]} />
                        </motion.div>

                        <svg viewBox="-160 -60 1100 700" className="w-full h-full object-contain filter drop-shadow-2xl overflow-visible">
                            <defs>
                                <filter id="neon-glow-emerald" x="-25%" y="-25%" width="150%" height="150%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                                <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>

                            {/* 1. Base Map Shape (Fills in early) */}
                            <motion.path
                                d={SRI_LANKA_PATH}
                                fill="#F8FAFC"
                                stroke="#cbd5e1"
                                strokeWidth="0.5"
                                style={{ opacity: baseMapOpacity }}
                            />

                            {/* 2. Animated Glowing Map Outline (Draws fully from 15% to 30%) */}
                            <motion.path
                                d={SRI_LANKA_PATH}
                                fill="none"
                                stroke="#A67C52"
                                strokeWidth="2"
                                strokeLinecap="round"
                                //filter="url(#neon-glow-emerald)"
                                style={{ pathLength: outlinePathLength }}
                            />

                            {/* 3. Map Nodes & Dashed Arrows & Flowing Cards embedded in SVG */}
                            {locations.map((loc) => (
                                <MapInteraction key={loc.id} loc={loc} scrollY={scrollYProgress} onClick={setSelectedLoc} />
                            ))}
                        </svg>
                    </motion.div>
                </div>

                {/* SECTION 4: STRATEGIC ANALYTICS PANEL (Slides in at the end) */}
                <motion.div
                    style={{ opacity: panelOpacity, x: panelX }}
                    className="absolute right-[3%] top-[12%] w-full max-w-xl z-30 pointer-events-auto hidden lg:block"
                >
                    <div className="px-6 py-8 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-lg flex flex-col gap-6">
                        {/* Header with live badge */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l4-4 4 4 4-4 4 4" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Live Market Intelligence</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Left column – title & description */}
                            <div>
                                <h2 className="text-4xl font-black text-slate-950 leading-[1.05]">
                                    Predictive <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Analytics</span>
                                </h2>
                                <p className="mt-3 text-sm text-slate-500 font-medium">
                                    AI‑powered market intelligence for Sri Lankan farmers, traders and everyday consumers.
                                </p>
                            </div>
                            {/* Right column – feature list */}
                            <div className="flex flex-col gap-2">
                                {[
                                    { icon: "📊", t: "Live Compare", d: "Vegetable prices across hubs" },
                                    { icon: "🤖", t: "AI Predict", d: "Forecasts to buy at peak" },
                                    { icon: "📈", t: "Trends", d: "Historical price charts" },
                                    { icon: "🗺️", t: "Logistics", d: "Regional coverage live" },
                                ].map((item, i) => (
                                    <div key={i} className="group flex items-start gap-2 p-2 rounded-lg hover:bg-white transition">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center text-sm">{item.icon}</div>
                                        <div>
                                            <h3 className="text-[13px] font-black text-slate-900">{item.t}</h3>
                                            <p className="text-[10px] text-slate-500">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* CTA button – vertical placement */}
                        <div className="flex flex-col items-start">
                            <a href="/markets" className="group relative overflow-hidden flex items-center gap-2 px-5 py-3 bg-slate-950 text-white rounded-xl shadow-md hover:shadow-lg transition">
                                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></span>
                                <span className="font-black text-sm uppercase tracking-widest">Explore Markets</span>
                                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300 text-sm">→</span>
                            </a>
                            <p className="mt-2 text-[10px] text-slate-400">Free • Updated daily • 7 hubs</p>
                        </div>
                    </div>
                </motion.div>

                {/* SECTION 5: MARKET IMAGE SLIDER */}
                <motion.div
                    style={{ opacity: panelOpacity, y: sliderY }}
                    className="absolute bottom-4 sm:bottom-10 left-0 right-0 w-full overflow-hidden z-20 pointer-events-auto"
                >
                    <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                        className="flex gap-4 w-[200vw] px-8"
                    >
                        {/* We duplicate the array to allow for infinite smooth panning */}
                        {[...locations, ...locations].map((loc, i) => (
                            <Link href={`/market/${loc.id}`} key={`${loc.id}-${i}`}>
                                <div className="relative w-56 sm:w-72 h-36 sm:h-48 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.15)] shrink-0 border border-white/40 cursor-pointer group">
                                    <img
                                        src={loc.image}
                                        alt={loc.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent transition-opacity group-hover:opacity-80" />

                                    <div className="absolute bottom-5 left-5 right-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: loc.color }} />
                                            <h4 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider truncate">{loc.name}</h4>
                                        </div>
                                        <p className="text-slate-300 font-bold text-[10px]">{loc.stat}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* MARKET DETAIL BOTTOM SHEET */}
            <MarketBottomSheet loc={selectedLoc} onClose={() => setSelectedLoc(null)} />

            {/* TALL SCROLL AREA INCREMENTED TO SLOW DOWN SCROLL SPEED */}
            <div className="h-[1200vh] w-full relative pointer-events-none" />
        </div>
    );
}

// --- SUB-COMPONENT: MAP LINES & PINS & EMBEDDED CARDS ---
function MapInteraction({ loc, scrollY, onClick }: { loc: LocationData, scrollY: any, onClick: (loc: LocationData) => void }) {
    const mid = (loc.range[0] + loc.range[1]) / 2;

    // Draw sweeping curved line OUTWARD, stay visible, then RETRACT backwards when panel appears
    const pathLength = useTransform(
        scrollY,
        [loc.range[0], mid, 0.82, 0.88],
        [0, 1, 1, 0]
    );

    const lineOpacity = useTransform(scrollY, [loc.range[0], mid, 0.83, 0.88], [0, 1, 1, 0]);

    // Nodes stay on the map even after lines retract
    const nodeOpacity = useTransform(scrollY, [loc.range[0], mid], [0, 1]);
    const pinScale = useTransform(scrollY, [loc.range[0], mid], [0.5, 1]);

    // Card slide up and fade in
    const cardOpacity = useTransform(scrollY, [loc.range[0], mid, 0.82, 0.88], [0, 1, 1, 0]);
    const cardY = useTransform(scrollY, [loc.range[0], mid, 0.82, 0.88], [30, 0, 0, 30]);

    // Calculate a beautiful bezier curve between the map node and the floating card
    // Control points pull horizontally
    const controlOffset = Math.abs(loc.tx - loc.cx) * 0.5;
    const cp1x = loc.cx + (loc.tx > loc.cx ? controlOffset : -controlOffset);
    const cp2x = loc.tx + (loc.tx > loc.cx ? -controlOffset : controlOffset);
    const curvedPath = `M ${loc.cx} ${loc.cy} C ${cp1x} ${loc.cy}, ${cp2x} ${loc.ty}, ${loc.tx} ${loc.ty}`;

    return (
        <motion.g className="group">
            {/* Smooth Sweeping Connected Line */}
            <motion.path
                d={curvedPath}
                fill="none"
                stroke={loc.color}
                strokeWidth="1.5"
                strokeDasharray="4 6"
                style={{ pathLength, opacity: lineOpacity }}
            />

            {/* Map Node Dot */}
            <motion.g style={{ opacity: nodeOpacity, scale: pinScale, transformOrigin: `${loc.cx}px ${loc.cy}px` }} className="pointer-events-none">
                <circle cx={loc.cx} cy={loc.cy} r="15" fill={loc.color} className="opacity-10" />
                <circle cx={loc.cx} cy={loc.cy} r="5" fill={loc.color} filter="url(#pin-glow)" />
                <circle cx={loc.cx} cy={loc.cy} r="2" fill="#ffffff" />
            </motion.g>

            {/* Mini Card Chip */}
            <foreignObject
                x={loc.tx - (loc.tx < loc.cx ? 150 : 0)}
                y={loc.ty - 18}
                width="150"
                height="60"
                className="overflow-visible pointer-events-auto"
            >
                <motion.div style={{ opacity: cardOpacity, y: cardY }} className="w-full p-1">
                    <button onClick={() => onClick(loc)} className="w-full text-left">
                        <div
                            className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-white/60 rounded-xl shadow-md px-2.5 py-1.5 cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
                            style={{ borderLeft: `3px solid ${loc.color}` }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: loc.color }} />
                            <div className="overflow-hidden">
                                <p className="font-extrabold text-[9px] text-slate-800 uppercase tracking-wider leading-none truncate">
                                    {loc.name}
                                </p>
                                <p className="text-[9px] font-bold mt-0.5 leading-none" style={{ color: loc.color }}>
                                    {loc.stat}
                                </p>
                            </div>
                        </div>
                    </button>
                </motion.div>
            </foreignObject>
        </motion.g>
    );
}