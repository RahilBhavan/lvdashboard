// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

contract DebugEnv is Script {
    function run() public {
        console.log("Debugging Environment Variables...");

        try vm.envUint("PRIVATE_KEY") returns (uint256 pk) {
            console.log("PRIVATE_KEY: Loaded (Length:", pk > 0 ? "Valid" : "Zero", ")");
        } catch {
            console.log("PRIVATE_KEY: FAILED TO LOAD");
        }

        try vm.envAddress("TOKEN0") returns (address t0) {
            console.log("TOKEN0:", t0);
        } catch {
            console.log("TOKEN0: FAILED TO LOAD");
        }

        try vm.envAddress("TOKEN1") returns (address t1) {
            console.log("TOKEN1:", t1);
        } catch {
            console.log("TOKEN1: FAILED TO LOAD");
        }

        try vm.envAddress("POSITION_MANAGER") returns (address pm) {
            console.log("POSITION_MANAGER:", pm);
        } catch {
            console.log("POSITION_MANAGER: FAILED TO LOAD");
        }

        try vm.envAddress("KEEPER_ADDRESS") returns (address k) {
            console.log("KEEPER_ADDRESS:", k);
        } catch {
            console.log("KEEPER_ADDRESS: FAILED TO LOAD (Check if it is a placeholder)");
        }
    }
}
