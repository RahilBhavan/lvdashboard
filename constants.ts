// CODE_FILES objects have been extracted to individual files in:
// - contracts/src/interfaces/IStrategyAdapter.sol
// - contracts/src/adapters/UniswapV3Adapter.sol
// - contracts/src/adapters/AaveV3Adapter.sol
// - contracts/src/CoreVault.sol
// - models/vamer_model.py
// - models/trend_model.py
// - contracts/test/CoreVault.t.sol
// - models/tests/test_vamer.py
// - scripts/keepers/bot.py
// - infra/Dockerfile

// Mock Data Generators for Visualization
export const generateChartData = () => {
    const data = [];
    let price = 1500;
    let volatility = 0.02; // Initial vol

    for (let i = 0; i < 50; i++) {
        const change = (Math.random() - 0.5) * price * volatility;
        price += change;

        // Simple GARCH-like clustering simulation
        if (Math.abs(change) > price * 0.01) {
            volatility = Math.min(volatility * 1.2, 0.08); // Spike
        } else {
            volatility = Math.max(volatility * 0.95, 0.01); // Decay
        }

        const upper = price * (1 + 2 * volatility);
        const lower = price * (1 - 2 * volatility);

        data.push({
            day: i,
            price: Number(price.toFixed(2)),
            upper: Number(upper.toFixed(2)),
            lower: Number(lower.toFixed(2)),
            volatility: Number((volatility * 100).toFixed(2))
        });
    }
    return data;
};