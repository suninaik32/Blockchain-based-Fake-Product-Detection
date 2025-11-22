const express = require('express');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { Web3 } = require('web3'); // <-- web3@4.x requires this destructuring
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Web3 configuration (update with your Ganache RPC URL)
const web3 = new Web3('http://localhost:7545');
const contractAddress ='0x80ee39aE5628B8b388AFEf125337B7bFF891cB02'; // Update after deployment
const contractABI = [ /* ... your ABI unchanged ... */ ];

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Utility function to compute SHA256 hash
function computeFinalHash(components) {
    let combinedHash = crypto.createHash('sha256').update('').digest('hex');
    components.forEach(component => {
        const hash = crypto.createHash('sha256');
        hash.update(combinedHash + component);
        combinedHash = hash.digest('hex');
    });
    return '0x' + combinedHash;
}

// API Routes

// Generate QR Code for product
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        const qrCodeData = JSON.stringify({ productId });
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
        res.json({ qrCodeUrl, productId });
    } catch (error) {
        console.error('QR Code generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Register product (manufacturer side)
app.post('/api/register-product', async (req, res) => {
    try {
        const { productId, components, manufacturerAddress } = req.body;
        if (!productId || !components || !manufacturerAddress) {
            return res.status(400).json({ error: 'Product ID, components, and manufacturer address are required' });
        }
        // Compute final hash from components
        const finalHash = computeFinalHash(components);

        // Here you would send a transaction with contract.methods.registerProduct(productId, finalHash)...

        res.json({
            productId,
            finalHash,
            components,
            message: 'Product registration data prepared for blockchain'
        });
    } catch (error) {
        console.error('Product registration error:', error);
        res.status(500).json({ error: 'Failed to register product' });
    }
});

// Verify product (customer side)
app.post('/api/verify-product', async (req, res) => {
    try {
        const { productId, components } = req.body;
        if (!productId || !components) {
            return res.status(400).json({ error: 'Product ID and components are required' });
        }
        // Compute hash from provided components
        const computedHash = computeFinalHash(components);

        // Here you would call contract.methods.verifyProduct(productId, computedHash).call()...

        const isGenuine = true; // This should actually come from the blockchain in a real setup!

        res.json({
            productId,
            computedHash,
            isGenuine,
            message: isGenuine ? 'GENUINE PRODUCT' : 'FAKE/TAMPERED PRODUCT'
        });
    } catch (error) {
        console.error('Product verification error:', error);
        res.status(500).json({ error: 'Failed to verify product' });
    }
});

// Get product info from blockchain
app.get('/api/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        // Here you would call contract.methods.getProduct(productId).call()...

        res.json({
            productId,
            exists: true,
            message: 'Product information retrieved from blockchain'
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to get product information' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('Make sure Ganache is running on http://localhost:7545');
});
