// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VeriDegree} from "../src/VeriDegree.sol";

contract Deploy is Script {
    function run() public {
        vm.startBroadcast();

        VeriDegree veridegree = new VeriDegree();

        console.log("Contrat VeriDegree deploye a l'adresse :", address(veridegree));

        vm.stopBroadcast();
    }
}