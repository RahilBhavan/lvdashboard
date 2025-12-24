import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mocking modules that might have missing dependencies (like arch)
mock_vamer = MagicMock()
mock_trend = MagicMock()
sys.modules["models"] = MagicMock()
sys.modules["models.vamer_model"] = mock_vamer
sys.modules["models.trend_model"] = mock_trend

# We need to mock environment variables and imports that might run on module load
with patch.dict(os.environ, {
    "RPC_URL": "http://mock-rpc", 
    "KEEPER_PK": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", 
    "VAULT_ADDRESS": "0xVaultAddress"
}):
    # Patch web3.Web3 so that when bot imports it, it gets the mock
    with patch("web3.Web3") as MockWeb3:
        # Also ensure we can import the bot module
        if "scripts.keepers.bot" in sys.modules:
            del sys.modules["scripts.keepers.bot"]
        from scripts.keepers import bot

class TestKeeperBot(unittest.TestCase):

    @patch("scripts.keepers.bot.requests.get")
    def test_fetch_market_data_success(self, mock_get):
        # Setup mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "prices": [[1000, 2000.0], [1001, 2010.0], [1002, 2005.0]]
        }
        mock_get.return_value = mock_response

        # Call function
        prices = bot.fetch_market_data()

        # Assertions
        self.assertEqual(prices, [2000.0, 2010.0, 2005.0])
        mock_get.assert_called_once()

    @patch("scripts.keepers.bot.requests.get")
    def test_fetch_market_data_failure(self, mock_get):
        # Setup mock to raise exception
        mock_get.side_effect = Exception("API Error")

        # Call function
        prices = bot.fetch_market_data()

        # Assertions
        self.assertEqual(prices, [])

    @patch("scripts.keepers.bot.predict_next_range")
    @patch("scripts.keepers.bot.get_hedge_ratio")
    def test_run_strategy_success(self, mock_get_hedge, mock_predict):
        # Setup mocks
        mock_predict.return_value = ((-100, 100))
        mock_get_hedge.return_value = 0.5
        
        price_history = [100.0] * 30

        # Call function
        lower, upper = bot.run_strategy(price_history)

        # Assertions
        self.assertEqual(lower, -100)
        self.assertEqual(upper, 100)
        mock_predict.assert_called_once_with(price_history)

    def test_run_strategy_insufficient_history(self):
        # Call with too few data points
        lower, upper = bot.run_strategy([100.0] * 5)
        self.assertIsNone(lower)
        self.assertIsNone(upper)

    def test_check_profitability_profitable(self):
        # Mock w3.eth.gas_price and from_wei
        bot.w3.eth.gas_price = 20000000000 # 20 gwei
        
        # We need to mock from_wei to return a float/decimal we can compare
        # Since bot.w3 is a MagicMock (from the import patch), we configure it
        # However, bot.w3 might be re-instantiated or we need to patch the instance used in bot
        
        # Easier way: Patch the specific w3 instance on the bot module
        with patch.object(bot.w3.eth, "gas_price", 20000000000), \
             patch.object(bot.w3, "from_wei", return_value=0.01): # 0.01 ETH cost
            
            result = bot.check_profitability(-100, 100)
            self.assertTrue(result)

    def test_check_profitability_too_expensive(self):
        with patch.object(bot.w3.eth, "gas_price", 20000000000), \
             patch.object(bot.w3, "from_wei", return_value=0.05): # 0.05 ETH cost > 0.02 threshold
            
            result = bot.check_profitability(-100, 100)
            self.assertFalse(result)

    @patch("scripts.keepers.bot.encode")
    def test_rebalance_transaction(self, mock_encode):
        # Mock account creation and contract
        mock_account = MagicMock()
        mock_account.address = "0xKeeper"
        
        mock_contract = MagicMock()
        
        # Setup w3 mocks
        with patch.object(bot.w3.eth.account, "from_key", return_value=mock_account), \
             patch.object(bot.w3.eth, "contract", return_value=mock_contract), \
             patch.object(bot.w3.eth, "get_transaction_count", return_value=1), \
             patch.object(bot.w3.eth, "gas_price", 20000000000), \
             patch.object(bot.w3.eth.account, "sign_transaction") as mock_sign, \
             patch.object(bot.w3.eth, "send_raw_transaction") as mock_send, \
             patch.object(bot.w3.eth, "wait_for_transaction_receipt") as mock_wait:

            mock_encode.return_value = b'encoded_data'
            mock_sign.return_value.raw_transaction = b'raw_tx'
            mock_send.return_value = b'tx_hash'
            mock_wait.return_value = {'blockNumber': 12345}

            # Call function
            bot.rebalance(-100, 100)

            # Assertions
            mock_contract.functions.rebalance.assert_called()
            mock_sign.assert_called()
            mock_send.assert_called_with(b'raw_tx')
            mock_wait.assert_called_with(b'tx_hash')

if __name__ == "__main__":
    unittest.main()
