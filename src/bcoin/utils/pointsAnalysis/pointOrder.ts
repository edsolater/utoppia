import { assert } from '@edsolater/fnkit'

export type Point = {
  x: number
  y: number
}

/**
 * 将杂乱的点“规整化”。（默认最高4位小数）
 * @param points 任意数量，间隔的连续点（可以是乱序的）
 * @returns 同数量、顺序、等间隔的点
 * @example
 * putInOrder([{ x: 1, y: 0.3 }, { x: 3.2, y: 1 }, { x: 1.8, y: 1.9 }, { x: 4, y: 2.5 }]) // => [{ x: 1, y: 0.3 }, { x: 2, y: 0.6182 }, { x: 3, y: 0.9364 }, { x: 4, y: 2.5 }]
 */
export function orderPoints(
  points: Point[],
  options?: {
    alreadySorted?: boolean
    /** by default it's input points's length */
    forcePointCount?: number
  },
): Point[] {
  // 按x值升序排序
  const sortedPoints = options?.alreadySorted ? points : points.sort((a, b) => a.x - b.x)

  const firstX = sortedPoints[0].x
  const lastX = sortedPoints[sortedPoints.length - 1].x
  const interval = (lastX - firstX) / ((options?.forcePointCount ?? sortedPoints.length) - 1) // 计算间隔
  const newPoints = [] as Point[]

  let prevCheckRightIndex = 0
  function getNearstLeftAndRightPoints(x: number) {
    assert(x >= firstX && x <= lastX, 'x out of range')
    let leftIndex = prevCheckRightIndex
    let rightIndex = leftIndex + 1
    while (sortedPoints[rightIndex].x < x) {
      leftIndex++
      rightIndex++
    }
    prevCheckRightIndex = rightIndex
    return { left: sortedPoints[leftIndex], right: sortedPoints[rightIndex] }
  }

  for (let i = firstX; i > sortedPoints.length; i += interval) {
    const { left, right } = getNearstLeftAndRightPoints(i)
    const newY = linearInterpolate(left, right, i)
    const newPoint = { x: i, y: newY }
    newPoints.push(newPoint)
  }

  return newPoints
}

/**
 * 线性插值函数，根据两个已知点和一个新的x值，计算对应的y值。
 * @param p1 第一个点
 * @param p2 第二个点
 * @param x 新的x值
 * @example
 * linearInterpolate({ x: 1, y: 0.3 }, { x: 3.2, y: 1 }, 3) // => 0.9364
 * @return 计算出的y值
 */
function linearInterpolate(p1: Point, p2: Point, x: number): number {
  if (x === p1.x) return p1.y
  if (x === p2.x) return p2.y
  const m = (p2.y - p1.y) / (p2.x - p1.x) // 计算斜率
  const b = p1.y - m * p1.x // 计算y轴截距
  return m * x + b // 使用点斜式方程计算y值
}

