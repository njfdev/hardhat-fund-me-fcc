const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const contractArgs = [ethUsdPriceFeedAddress]

    // when deploying for localhost or the hardhat network, we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: contractArgs, // put price feed address here
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // if we're not on a development chain, verify the contract
        await verify(fundMe.address, contractArgs)
    }
    log("----------------------------------------------------------------")
}

module.exports.tags = ["all", "fund-me"]
