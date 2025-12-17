'use client'

import { useState, useEffect } from 'react'
import { FiAlertTriangle, FiZap, FiRefreshCw, FiPlus, FiTarget, FiCheckCircle, FiArrowUpRight, FiInfo } from 'react-icons/fi'

interface DissonanceMatrixProps {
  user: any
  principles: any[]
}

interface MatrixPosition {
  x: number // 0-100, representing position on X-axis
  y: number // 0-100, representing position on Y-axis
  quadrant: 1 | 2 | 3 | 4
}

export default function DissonanceMatrix({ user, principles }: DissonanceMatrixProps) {
  const [selectedMatrix, setSelectedMatrix] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [position, setPosition] = useState<MatrixPosition | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [desiredX, setDesiredX] = useState<number>(50)
  const [desiredY, setDesiredY] = useState<number>(50)
  const [showSliders, setShowSliders] = useState(false)

  const corePrinciples = principles.filter(p => p.status === 'Core Principles')

  // Predefined matrix configurations with questions
  const matrixConfigs = [
    {
      id: 'pattern-vs-attention',
      title: 'Pattern Recognition vs. Pay Attention',
      axisX: {
        name: 'Pattern Recognition',
        low: 'Ignore patterns, treat each situation as unique',
        high: 'Strongly rely on patterns and past experience',
      },
      axisY: {
        name: 'Pay Attention',
        low: 'Rely on assumptions, miss details',
        high: 'Observe carefully, notice everything',
      },
      questions: [
        {
          id: 'q1',
          text: 'When facing a new problem, my first instinct is to...',
          options: [
            { text: 'Look for similar problems I\'ve solved before', value: { x: 80, y: 20 } },
            { text: 'Carefully observe all the unique details', value: { x: 20, y: 80 } },
            { text: 'Use patterns AND observe carefully', value: { x: 60, y: 70 } },
            { text: 'Start fresh without assumptions', value: { x: 30, y: 40 } },
          ],
        },
        {
          id: 'q2',
          text: 'I tend to make mistakes when I...',
          options: [
            { text: 'Assume I\'ve seen this before', value: { x: 85, y: 15 } },
            { text: 'Miss obvious details right in front of me', value: { x: 25, y: 15 } },
            { text: 'Overthink and analyze too much', value: { x: 50, y: 50 } },
            { text: 'Act without recognizing patterns', value: { x: 15, y: 60 } },
          ],
        },
        {
          id: 'q3',
          text: 'The best approach is to...',
          options: [
            { text: 'Recognize patterns first, then observe differences', value: { x: 70, y: 65 } },
            { text: 'Observe everything first, then find patterns', value: { x: 40, y: 75 } },
            { text: 'Trust my pattern recognition completely', value: { x: 90, y: 30 } },
            { text: 'Focus only on what\'s unique this time', value: { x: 20, y: 80 } },
          ],
        },
        {
          id: 'q4',
          text: 'In a crisis, I...',
          options: [
            { text: 'Apply what worked before', value: { x: 75, y: 25 } },
            { text: 'Look for what\'s different this time', value: { x: 30, y: 70 } },
            { text: 'Balance pattern recognition with careful observation', value: { x: 60, y: 60 } },
            { text: 'Panic and miss everything', value: { x: 50, y: 20 } },
          ],
        },
      ],
      quadrants: {
        q1: { name: 'Pattern Blind', description: 'You rely heavily on patterns but miss unique details. Risk: Assuming "same thing" when it\'s actually different.' },
        q2: { name: 'Balanced Wisdom', description: 'You recognize patterns AND pay attention. This is the ideal balance - "Same Thing Only Different" applied correctly.' },
        q3: { name: 'Detail Overwhelm', description: 'You notice everything but struggle to see patterns. Risk: Treating each situation as completely unique.' },
        q4: { name: 'Unfocused', description: 'You neither recognize patterns nor pay attention. Risk: Missing both the familiar and the unique.' },
      },
    },
    {
      id: 'context-vs-action',
      title: 'Context Analysis vs. Take Action',
      axisX: {
        name: 'Context Analysis',
        low: 'Act quickly with minimal context',
        high: 'Deeply analyze context before acting',
      },
      axisY: {
        name: 'Take Action',
        low: 'Paralyzed by analysis',
        high: 'Act decisively',
      },
      questions: [
        {
          id: 'q1',
          text: 'Before making a decision, I...',
          options: [
            { text: 'Need to understand everything first', value: { x: 85, y: 20 } },
            { text: 'Gather just enough context, then act', value: { x: 60, y: 75 } },
            { text: 'Act quickly with minimal information', value: { x: 25, y: 80 } },
            { text: 'Get stuck analyzing and never act', value: { x: 90, y: 15 } },
          ],
        },
        {
          id: 'q2',
          text: 'I feel most comfortable when...',
          options: [
            { text: 'I have complete context', value: { x: 80, y: 25 } },
            { text: 'I can act on partial information', value: { x: 40, y: 70 } },
            { text: 'I understand the "why" behind everything', value: { x: 85, y: 30 } },
            { text: 'I\'m making progress, even if imperfect', value: { x: 50, y: 75 } },
          ],
        },
        {
          id: 'q3',
          text: 'My biggest weakness is...',
          options: [
            { text: 'Acting without enough context', value: { x: 20, y: 80 } },
            { text: 'Over-analyzing and missing opportunities', value: { x: 85, y: 20 } },
            { text: 'Not understanding the full picture', value: { x: 30, y: 70 } },
            { text: 'Being paralyzed by too much information', value: { x: 90, y: 15 } },
          ],
        },
        {
          id: 'q4',
          text: 'The best approach is...',
          options: [
            { text: 'Understand context fully, then act', value: { x: 75, y: 60 } },
            { text: 'Get enough context to act wisely', value: { x: 65, y: 70 } },
            { text: 'Act first, learn context later', value: { x: 25, y: 75 } },
            { text: 'Context is everything, action can wait', value: { x: 85, y: 25 } },
          ],
        },
      ],
      quadrants: {
        q1: { name: 'Analysis Paralysis', description: 'You deeply analyze context but struggle to act. Risk: Perfect understanding, zero progress.' },
        q2: { name: 'Wise Action', description: 'You balance context understanding with decisive action. This is the ideal - context informs action.' },
        q3: { name: 'Reckless Action', description: 'You act quickly without enough context. Risk: Solving the wrong problem.' },
        q4: { name: 'Stagnant', description: 'You neither understand context nor take action. Risk: Complete inaction.' },
      },
    },
  ]

  const currentMatrix = matrixConfigs.find(m => m.id === selectedMatrix)

  const calculatePosition = () => {
    if (!currentMatrix) return

    const totalX = Object.values(answers).reduce((sum, idx) => {
      const question = currentMatrix.questions.find(q => q.id === Object.keys(answers).find(k => answers[k] === idx)?.split('_')[0])
      if (question) {
        const option = question.options[idx]
        return sum + option.value.x
      }
      return sum
    }, 0)

    const totalY = Object.values(answers).reduce((sum, idx) => {
      const question = currentMatrix.questions.find(q => q.id === Object.keys(answers).find(k => answers[k] === idx)?.split('_')[0])
      if (question) {
        const option = question.options[idx]
        return sum + option.value.y
      }
      return sum
    }, 0)

    const questionCount = Object.keys(answers).length
    const avgX = totalX / questionCount
    const avgY = totalY / questionCount

    // Determine quadrant
    let quadrant: 1 | 2 | 3 | 4
    if (avgX >= 50 && avgY >= 50) quadrant = 2 // Top-right
    else if (avgX < 50 && avgY >= 50) quadrant = 3 // Top-left
    else if (avgX < 50 && avgY < 50) quadrant = 4 // Bottom-left
    else quadrant = 1 // Bottom-right

    setPosition({ x: avgX, y: avgY, quadrant })
    // Initialize desired position to ideal Q2 (recommended balance)
    setDesiredX(75)
    setDesiredY(75)
    setShowResults(true)
  }

  const getDesiredQuadrant = (x: number, y: number): 1 | 2 | 3 | 4 => {
    if (x >= 50 && y >= 50) return 2
    if (x < 50 && y >= 50) return 3
    if (x < 50 && y < 50) return 4
    return 1
  }

  const getRecommendations = () => {
    if (!position || !currentMatrix) return null

    const xDiff = desiredX - position.x
    const yDiff = desiredY - position.y
    const recommendations = []

    if (xDiff > 5) {
      recommendations.push({
        axis: 'X',
        direction: 'increase',
        amount: Math.abs(xDiff).toFixed(0),
        principle: currentMatrix.axisX.name,
        benefit: `You'll better recognize patterns and leverage past experience`,
        tradeoff: `You may need to be more careful not to miss unique details`,
      })
    } else if (xDiff < -5) {
      recommendations.push({
        axis: 'X',
        direction: 'decrease',
        amount: Math.abs(xDiff).toFixed(0),
        principle: currentMatrix.axisX.name,
        benefit: `You'll be more open to unique situations`,
        tradeoff: `You may miss patterns that could help you solve problems faster`,
      })
    }

    if (yDiff > 5) {
      recommendations.push({
        axis: 'Y',
        direction: 'increase',
        amount: Math.abs(yDiff).toFixed(0),
        principle: currentMatrix.axisY.name,
        benefit: `You'll notice more details and observe better`,
        tradeoff: `You may spend more time observing before acting`,
      })
    } else if (yDiff < -5) {
      recommendations.push({
        axis: 'Y',
        direction: 'decrease',
        amount: Math.abs(yDiff).toFixed(0),
        principle: currentMatrix.axisY.name,
        benefit: `You'll act faster and avoid over-analysis`,
        tradeoff: `You may miss important details that are right in front of you`,
      })
    }

    return recommendations
  }

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const resetMatrix = () => {
    setSelectedMatrix(null)
    setAnswers({})
    setPosition(null)
    setShowResults(false)
  }

  const allQuestionsAnswered = currentMatrix && currentMatrix.questions.every(q => answers[q.id] !== undefined)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dissonance Matrix</h2>
        <p className="text-gray-600 mt-1">
          Visualize where you stand between two contradicting principles. Answer questions to find your position.
        </p>
        <p className="text-sm text-gray-500 mt-2 italic">
          "Same Thing Only Different" - Understand the tension, find your balance.
        </p>
      </div>

      {!selectedMatrix ? (
        <div>
          <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="bg-orange-500 rounded-lg p-3">
                <FiTarget className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900 mb-2">How It Works</h3>
                <p className="text-sm text-orange-800 leading-relaxed">
                  Select a matrix to explore the tension between two principles. Answer questions to discover where you currently 
                  stand in the four-quadrant matrix. Each quadrant represents a different approach to balancing these principles.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matrixConfigs.map((matrix) => (
              <button
                key={matrix.id}
                onClick={() => setSelectedMatrix(matrix.id)}
                className="bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 border-white/30 hover:border-orange-300/50 transition-all text-left"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{matrix.title}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  <div className="mb-1"><strong>X-Axis:</strong> {matrix.axisX.name}</div>
                  <div><strong>Y-Axis:</strong> {matrix.axisY.name}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {matrix.questions.length} questions
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : currentMatrix && !showResults ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{currentMatrix.title}</h3>
              <p className="text-sm text-gray-600">Answer all questions to see your position</p>
            </div>
            <button
              onClick={resetMatrix}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Back
            </button>
          </div>

          <div className="space-y-6 mb-6">
            {currentMatrix.questions.map((question, qIdx) => (
              <div
                key={question.id}
                className="bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 border-white/30"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {qIdx + 1}. {question.text}
                </h4>
                <div className="space-y-3">
                  {question.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(question.id, optIdx)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        answers[question.id] === optIdx
                          ? 'border-primary-500 bg-primary-50/70 text-primary-900'
                          : 'border-gray-200 hover:border-primary-300 bg-white/50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[question.id] === optIdx
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[question.id] === optIdx && (
                            <FiCheckCircle className="text-white text-xs" />
                          )}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {allQuestionsAnswered && (
            <div className="text-center">
              <button
                onClick={calculatePosition}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <FiTarget />
                See My Position
              </button>
            </div>
          )}
        </div>
      ) : position && currentMatrix ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Your Position: {currentMatrix.quadrants[`q${position.quadrant}` as keyof typeof currentMatrix.quadrants].name}</h3>
            <button
              onClick={resetMatrix}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Start Over
            </button>
          </div>

          {/* Visual Matrix */}
          <div className="bg-white/75 backdrop-blur-md rounded-xl shadow-xl p-8 border-2 border-white/30 mb-6">
            <div className="relative" style={{ aspectRatio: '1', maxWidth: '600px', margin: '0 auto' }}>
              {/* Grid Lines */}
              <div className="absolute inset-0">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              </div>

              {/* Quadrants */}
              <div className="absolute inset-0 grid grid-cols-2">
                <div className={`border-r border-b border-gray-200 p-4 ${position.quadrant === 4 ? 'bg-red-100/50' : 'bg-gray-50/30'}`}>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Q4</div>
                  <div className="text-xs text-gray-500">Low {currentMatrix.axisX.name}</div>
                  <div className="text-xs text-gray-500">Low {currentMatrix.axisY.name}</div>
                </div>
                <div className={`border-b border-gray-200 p-4 ${position.quadrant === 3 ? 'bg-yellow-100/50' : 'bg-gray-50/30'}`}>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Q3</div>
                  <div className="text-xs text-gray-500">Low {currentMatrix.axisX.name}</div>
                  <div className="text-xs text-gray-500">High {currentMatrix.axisY.name}</div>
                </div>
                <div className={`border-r border-gray-200 p-4 ${position.quadrant === 1 ? 'bg-blue-100/50' : 'bg-gray-50/30'}`}>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Q1</div>
                  <div className="text-xs text-gray-500">High {currentMatrix.axisX.name}</div>
                  <div className="text-xs text-gray-500">Low {currentMatrix.axisY.name}</div>
                </div>
                <div className={`p-4 ${position.quadrant === 2 ? 'bg-green-100/50' : 'bg-gray-50/30'}`}>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Q2</div>
                  <div className="text-xs text-gray-500">High {currentMatrix.axisX.name}</div>
                  <div className="text-xs text-gray-500">High {currentMatrix.axisY.name}</div>
                </div>
              </div>

              {/* Current Position Marker */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${position.x}%`,
                  top: `${100 - position.y}%`, // Invert Y for screen coordinates
                }}
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-primary-700 bg-white/90 px-2 py-1 rounded">
                    Current
                  </div>
                </div>
              </div>

              {/* Desired Position Marker (if sliders are shown) */}
              {showSliders && (
                <>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                    style={{
                      left: `${desiredX}%`,
                      top: `${100 - desiredY}%`, // Invert Y for screen coordinates
                    }}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-green-700 bg-white/90 px-2 py-1 rounded">
                        Target
                      </div>
                    </div>
                  </div>
                  {/* Line connecting current to desired */}
                  <svg className="absolute inset-0 z-10 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                    <line
                      x1={`${position.x}%`}
                      y1={`${100 - position.y}%`}
                      x2={`${desiredX}%`}
                      y2={`${100 - desiredY}%`}
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.6"
                    />
                  </svg>
                </>
              )}

              {/* Axis Labels */}
              <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {currentMatrix.axisY.name}
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 text-sm font-semibold text-gray-700">
                {currentMatrix.axisX.name}
              </div>
            </div>
          </div>

          {/* Quadrant Description */}
          <div className={`bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 ${
            position.quadrant === 2 ? 'border-green-300' :
            position.quadrant === 1 ? 'border-blue-300' :
            position.quadrant === 3 ? 'border-yellow-300' :
            'border-red-300'
          }`}>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Quadrant {position.quadrant}: {currentMatrix.quadrants[`q${position.quadrant}` as keyof typeof currentMatrix.quadrants].name}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {currentMatrix.quadrants[`q${position.quadrant}` as keyof typeof currentMatrix.quadrants].description}
            </p>
            <div className="mt-4 p-4 bg-primary-50/50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-800">
                <strong>Your coordinates:</strong> X: {position.x.toFixed(1)}%, Y: {position.y.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Trade-off Sliders Section */}
          <div className="bg-white/75 backdrop-blur-md rounded-xl shadow-xl p-6 border-2 border-white/30 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">Find Your Comfort Zone</h4>
                <p className="text-sm text-gray-600">
                  Adjust the sliders to explore your ideal balance. Q2 (top-right) is recommended for optimal balance.
                </p>
              </div>
              <button
                onClick={() => setShowSliders(!showSliders)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition font-semibold flex items-center gap-2"
              >
                <FiArrowUpRight />
                {showSliders ? 'Hide' : 'Show'} Trade-off Sliders
              </button>
            </div>

            {showSliders && (
              <div className="space-y-6">
                {/* Ideal Q2 Recommendation */}
                <div className="bg-green-50/70 backdrop-blur-sm rounded-lg p-4 border-2 border-green-300">
                  <div className="flex items-start gap-3">
                    <FiInfo className="text-green-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-bold text-green-900 mb-1">Recommended: Quadrant 2 (Top-Right)</h5>
                      <p className="text-sm text-green-800">
                        This represents the ideal balance - high on both principles. You recognize patterns AND pay attention to details.
                        This is "Same Thing Only Different" applied correctly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* X-Axis Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-lg font-semibold text-gray-900">
                      {currentMatrix.axisX.name}
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{currentMatrix.axisX.low}</span>
                      <span className="text-lg font-bold text-primary-600">{desiredX}%</span>
                      <span className="text-xs text-gray-500">{currentMatrix.axisX.high}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={desiredX}
                    onChange={(e) => setDesiredX(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    style={{
                      background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${desiredX}%, #3b82f6 ${desiredX}%, #3b82f6 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Y-Axis Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-lg font-semibold text-gray-900">
                      {currentMatrix.axisY.name}
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{currentMatrix.axisY.low}</span>
                      <span className="text-lg font-bold text-primary-600">{desiredY}%</span>
                      <span className="text-xs text-gray-500">{currentMatrix.axisY.high}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={desiredY}
                    onChange={(e) => setDesiredY(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    style={{
                      background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${desiredY}%, #3b82f6 ${desiredY}%, #3b82f6 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Desired Position Info */}
                {(() => {
                  const desiredQuadrant = getDesiredQuadrant(desiredX, desiredY)
                  const recommendations = getRecommendations()
                  return (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border-2 ${
                        desiredQuadrant === 2 ? 'bg-green-50/70 border-green-300' :
                        desiredQuadrant === 1 ? 'bg-blue-50/70 border-blue-300' :
                        desiredQuadrant === 3 ? 'bg-yellow-50/70 border-yellow-300' :
                        'bg-red-50/70 border-red-300'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-900">
                            Your Target Position: Quadrant {desiredQuadrant}
                          </h5>
                          <span className="text-sm font-semibold text-gray-700">
                            X: {desiredX}% | Y: {desiredY}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {currentMatrix.quadrants[`q${desiredQuadrant}` as keyof typeof currentMatrix.quadrants].description}
                        </p>
                      </div>

                      {/* Recommendations */}
                      {recommendations && recommendations.length > 0 && (
                        <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-300">
                          <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <FiArrowUpRight />
                            Recommendations to Reach Your Target
                          </h5>
                          <div className="space-y-3">
                            {recommendations.map((rec, idx) => (
                              <div key={idx} className="bg-white/60 rounded-lg p-3 border border-blue-200">
                                <div className="font-semibold text-blue-900 mb-1">
                                  {rec.direction === 'increase' ? 'Increase' : 'Decrease'} {rec.principle} by ~{rec.amount}%
                                </div>
                                <div className="text-sm text-gray-700 space-y-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>Benefit:</strong> {rec.benefit}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-orange-600 font-bold">⚠</span>
                                    <span><strong>Trade-off:</strong> {rec.tradeoff}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Distance to Ideal */}
                      {desiredQuadrant !== 2 && (
                        <div className="bg-yellow-50/70 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-300">
                          <p className="text-sm text-yellow-900">
                            <strong>Note:</strong> You're targeting Quadrant {desiredQuadrant}. For optimal balance, 
                            consider moving toward Quadrant 2 (top-right) where both principles are high.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
