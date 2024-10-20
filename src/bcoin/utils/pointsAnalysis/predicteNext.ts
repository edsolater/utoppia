import { assert } from '@edsolater/fnkit'
import type { Point } from './pointOrder'

/**
 *
 * 通过已知的点（走势图），预测下一个点的走势。
 *
 * 预测方式：
 * 1. 速度、加速度、加加速度
 *    - 根据最后2个点，算出速度，然后根据速度，预测下一个点的位置。
 *    - 根据最后3个点，算出加速度，然后根据加速度，预测下一个点的位置。
 *    - 根据最后4个点，算出加加速度，然后根据加加速度，预测下一个点的位置。
 *    - 根据最后5个点，算出加加加速度，然后根据加加加速度，预测下一个点的位置。
 * 2. 关注近一天的最高、最低点
 * 3. 当前已经涨跌了多少
 * 4. 市场短期看涨、看跌（可选）
 * 5. 市场长期看涨、看跌（可选）
 *
 * @param orderedPoints “规整化”后的点们
 * @return 涨的概率、跌的概率
 */
function predictNextPoint(
  orderedPoints: Point[],
  options?: {
    /**
     * -1 ~ 0 ~ 1.
     * -1 代表市场看跌，
     * 0 代表市场不确定，
     * 1 代表市场看涨。
     * @example .75（3/4）代表80%的人认为短期市场会涨，20%的人认为短期市场会跌。
     **/
    shortMarketProbability: number
  },
): { goUpProbability: number; goDownProbability: number } {
  const len = orderedPoints.length
  assert(len >= 2, 'At least two points are required for prediction.')
  throw new Error('Not implemented yet.')
}

/**
 * 加权移动平均法（WMA）预测下一个点
 * WMA用于揭示时间序列中的趋势或波动，尤其是当数据中有噪声时，可以通过加权方式更好地关注关键点。
 *
 * @param inputs 一系列点
 * @returns WMA 预测的下一个点
 */
function prediteNextNumber(inputs: number[]): number {
  const n = inputs.length
  assert(n >= 2, 'At least two points are needed for prediction.')

  const alpha = 0.8 // 指数衰减参数

  // 动态决定窗口大小：小于等于 20 时，考虑所有点；大于 20 时，考虑最近的 50%
  const windowSize = n <= 20 ? n : Math.floor(n * 0.5)

  let weightedSum = 0
  let totalWeight = 0
  let weight = 1

  // 从最近的数据开始应用指数加权
  for (let i = n - 1; i >= Math.max(0, n - windowSize); i--) {
    weightedSum += inputs[i] * weight
    totalWeight += weight
    weight *= alpha // 指数衰减
  }

  const predictedNextPoint = weightedSum / totalWeight

  return predictedNextPoint
}

/**
 * 求阶导数
 *
 * 值（0阶） => 变化速率（1阶） // 路程 -> 速度
 * 变化速率（1阶） => 变化速率的速率（2阶）// 速度 -> 加速度
 * 变化速率的速率（2阶） => 变化速率的速率的速率（3阶）// 加速度 -> 加加速度
 * 变化速率的速率的速率（3阶） => 变化速率的速率的速率的速率（4阶）// 加加速度 -> 加加加速度
 *
 * @example
 * calcDeltaPoints([{ x: 1, y: 0.3 }, { x: 2, y: 1 }, { x: 3, y: 1.9 }, { x: 4, y: 2.5 }]) // => [{ x: 1.5, y: 0.7 }, { x: 2.5, y: 0.9 }, { x: 3.5, y: 0.6 }]
 * calcDeltaPoints([{ x: 1.5, y: 0.7 }, { x: 2.5, y: 0.9 }, { x: 3.5, y: 0.6 }]) // => [{ x: 2, y: 0.2 }, { x: 3, y: -0.3 }]
 */
function calcDeltaPoints(orderedPoints: Point[]) {
  const deltaPoints = [] as Point[]
  for (let i = 0; i < orderedPoints.length - 1; i++) {
    const p1 = orderedPoints[i]
    const p2 = orderedPoints[i + 1]
    const deltaX = (p2.x - p1.x) / 2
    const deltaY = p2.y - p1.y
    const deltaPoint = { x: p1.x + deltaX, y: deltaY }
    deltaPoints.push(deltaPoint)
  }
  return deltaPoints
}
