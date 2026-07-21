"""
indicators.py — pure-python technical indicators (no numpy required).

Shared by the Tecnic agent. Each function operates on a list of prices
(oldest -> newest) and returns either a scalar or a tuple.
"""

import math


def sma(series, period):
    if len(series) < period:
        return None
    return sum(series[-period:]) / period


def ema_series(series, period):
    if len(series) < period:
        return []
    k = 2 / (period + 1)
    out = [series[0]]
    for price in series[1:]:
        out.append(price * k + out[-1] * (1 - k))
    return out


def ema(series, period):
    s = ema_series(series, period)
    return s[-1] if s else None


def rsi(series, period=14):
    if len(series) < period + 1:
        return None
    gains, losses = [], []
    for i in range(-period, 0):
        change = series[i] - series[i - 1]
        gains.append(max(change, 0))
        losses.append(max(-change, 0))
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def macd(series, fast=12, slow=26, signal=9):
    if len(series) < slow + signal:
        return None, None, None
    ema_fast = ema_series(series, fast)
    ema_slow = ema_series(series, slow)
    n = min(len(ema_fast), len(ema_slow))
    macd_line = [ema_fast[-n + i] - ema_slow[-n + i] for i in range(n)]
    signal_line = ema_series(macd_line, signal)
    if not signal_line:
        return None, None, None
    return macd_line[-1], signal_line[-1], macd_line[-1] - signal_line[-1]


def bollinger(series, period=20, num_std=2.0):
    if len(series) < period:
        return None, None, None
    window = series[-period:]
    mid = sum(window) / period
    variance = sum((x - mid) ** 2 for x in window) / period
    std = math.sqrt(variance)
    return mid + num_std * std, mid, mid - num_std * std


def pct_change(series, lookback):
    if len(series) < lookback + 1 or series[-1 - lookback] == 0:
        return None
    return (series[-1] - series[-1 - lookback]) / series[-1 - lookback] * 100


def logistic(x, k=1.0):
    """Squash a raw score into 0..1 via logistic function."""
    try:
        return 1 / (1 + math.exp(-k * x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0
