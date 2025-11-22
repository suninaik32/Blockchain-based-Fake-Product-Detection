module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",   // Localhost (Ganache)
      port: 7545,          // Ganache default port
      network_id: "*",     // Match any network id
      gas: 6721975,
      gasPrice: 20000000000
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.0",  // Specify exact compiler version
      docker: false,     // Use solc-bin instead of local Docker
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  },

  db: {
    enabled: false
  }
};
