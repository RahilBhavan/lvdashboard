import IStrategyAdapter from './contracts/src/interfaces/IStrategyAdapter.sol?raw';
import UniswapV3Adapter from './contracts/src/adapters/UniswapV3Adapter.sol?raw';
import AaveV3Adapter from './contracts/src/adapters/AaveV3Adapter.sol?raw';
import CoreVault from './contracts/src/CoreVault.sol?raw';
import VamerModel from './models/vamer_model.py?raw';
import TrendModel from './models/trend_model.py?raw';
import CoreVaultTest from './contracts/test/CoreVault.t.sol?raw';
import VamerModelTest from './models/tests/test_vamer.py?raw';
import KeeperBot from './scripts/keepers/bot.py?raw';
import Dockerfile from './infra/Dockerfile?raw';

export const CODE_FILES = {
    I_STRATEGY_ADAPTER: IStrategyAdapter,
    UNISWAP_V3_ADAPTER: UniswapV3Adapter,
    AAVE_V3_ADAPTER: AaveV3Adapter,
    CORE_VAULT: CoreVault,
    VAMER_MODEL: VamerModel,
    TREND_MODEL: TrendModel,
    CORE_VAULT_TEST: CoreVaultTest,
    VAMER_MODEL_TEST: VamerModelTest,
    KEEPER_BOT: KeeperBot,
    DOCKERFILE: Dockerfile
};

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