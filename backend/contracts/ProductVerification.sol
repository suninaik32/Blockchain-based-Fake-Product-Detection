// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductVerification {
    struct Product {
        string productId;
        bytes32 finalHash;
        address manufacturer;
        uint256 timestamp;
    }
    
    mapping(string => Product) public products;
    mapping(address => bool) public authorizedManufacturers;
    address public owner;
    
    event ProductRegistered(string productId, bytes32 finalHash, address manufacturer);
    event ProductVerified(string productId, bool isGenuine);
    event ManufacturerAuthorized(address manufacturer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedManufacturers[msg.sender], "Only authorized manufacturers can register products");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true;
    }
    
    function authorizeManufacturer(address _manufacturer) external onlyOwner {
        authorizedManufacturers[_manufacturer] = true;
        emit ManufacturerAuthorized(_manufacturer);
    }
    
    function registerProduct(
        string memory _productId, 
        bytes32 _finalHash
    ) external onlyAuthorized {
        require(bytes(_productId).length > 0, "Product ID cannot be empty");
        require(products[_productId].timestamp == 0, "Product already registered");
        
        products[_productId] = Product({
            productId: _productId,
            finalHash: _finalHash,
            manufacturer: msg.sender,
            timestamp: block.timestamp
        });
        
        emit ProductRegistered(_productId, _finalHash, msg.sender);
    }
    
    function verifyProduct(
        string memory _productId, 
        bytes32 _computedHash
    ) external view returns (bool) {
        Product memory product = products[_productId];
        require(product.timestamp > 0, "Product not found");
        
        bool isGenuine = (product.finalHash == _computedHash);
        return isGenuine;
    }
    
    function getProduct(string memory _productId) external view returns (
        string memory productId,
        bytes32 finalHash,
        address manufacturer,
        uint256 timestamp
    ) {
        Product memory product = products[_productId];
        require(product.timestamp > 0, "Product not found");
        
        return (
            product.productId,
            product.finalHash,
            product.manufacturer,
            product.timestamp
        );
    }
    
    function computeComponentHash(string[] memory components) external pure returns (bytes32) {
        bytes32 combinedHash = keccak256(abi.encodePacked(""));
        
        for (uint i = 0; i < components.length; i++) {
            combinedHash = keccak256(abi.encodePacked(combinedHash, components[i]));
        }
        
        return combinedHash;
    }
}