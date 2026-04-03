// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VeriDegree} from "../src/VeriDegree.sol";

contract VeriDegreeTest is Test {
    VeriDegree public veridegree;

    address public admin = address(this);
    address public student = address(0x123);
    address public unauthorized = address(0x456);

    string constant DIPLOMA_URI = "ipfs://QmTestCID123456789";
    uint256 constant TOKEN_ID = 0; // Ajout du Token ID pour correspondre à votre fonction safeMint

    function setUp() public {
        veridegree = new VeriDegree();
        // Si le constructeur de VeriDegree donne bien le rôle Minter à msg.sender,
        // "admin" (address(this)) a le droit de mint par défaut ici.
    }

    function testMintAsMinter() public {
        // Remplacement de 'mint' par 'safeMint' avec les 3 arguments
        veridegree.safeMint(student, TOKEN_ID, DIPLOMA_URI);
        assertEq(veridegree.balanceOf(student), 1);
        assertEq(veridegree.ownerOf(TOKEN_ID), student);
    }

    function testRevertMintAsNonMinter() public {
        vm.prank(unauthorized);
        vm.expectRevert(); // On laisse vide pour attraper n'importe quelle erreur AccessControl
        veridegree.safeMint(student, TOKEN_ID, DIPLOMA_URI);
    }

    function testTokenURI() public {
        veridegree.safeMint(student, TOKEN_ID, DIPLOMA_URI);
        assertEq(veridegree.tokenURI(TOKEN_ID), DIPLOMA_URI);
    }

    function testSoulboundReverts() public {
        veridegree.safeMint(student, TOKEN_ID, DIPLOMA_URI);

        vm.startPrank(student);

        // Remplacement par la chaîne de caractères EXACTE présente dans votre contrat
        vm.expectRevert("VeriDegree: Transfert interdit (Soulbound)");
        veridegree.transferFrom(student, unauthorized, TOKEN_ID);

        vm.expectRevert("VeriDegree: Transfert interdit (Soulbound)");
        veridegree.approve(unauthorized, TOKEN_ID);

        vm.stopPrank();
    }
}