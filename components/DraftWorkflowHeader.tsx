'use client'

import { FiCheckCircle, FiClock } from 'react-icons/fi'

export type WorkflowStepKey = 'draft' | 'collaborate' | 'submit' | 'review' | 'publish'
export type WorkflowStepState = 'done' | 'current' | 'future'

function stateClasses(state: WorkflowStepState) {
  if (state === 'done') return { dot: 'bg-green-600', text: 'text-green-700', line: 'bg-green-500' }
  if (state === 'current') return { dot: 'bg-yellow-500', text: 'text-yellow-700', line: 'bg-yellow-300' }
  return { dot: 'bg-gray-300', text: 'text-gray-500', line: 'bg-gray-200' }
}

export default function DraftWorkflowHeader({
  stepStates,
  onStepClick,
  collaborateOptional = true,
}: {
  stepStates: Record<WorkflowStepKey, WorkflowStepState>
  onStepClick?: (key: WorkflowStepKey, state: WorkflowStepState) => void
  collaborateOptional?: boolean
}) {
  const steps: Array<{ key: WorkflowStepKey; label: string; sub: string }> = [
    { key: 'draft', label: 'Draft', sub: 'Owner' },
    { key: 'collaborate', label: collaborateOptional ? 'Collaborate (Optional)' : 'Collaborate', sub: 'Subscribers' },
    { key: 'submit', label: 'Submit', sub: 'Owner' },
    { key: 'review', label: 'Moderator Review', sub: 'Moderator' },
    { key: 'publish', label: 'Publish', sub: 'System' },
  ]

  return (
    <div className="mb-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-lg font-bold text-gray-900">Workflow</div>
        <div className="text-xs text-gray-600 inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <FiCheckCircle className="text-green-600" /> done
          </span>
          <span className="inline-flex items-center gap-1">
            <FiClock className="text-yellow-700" /> in progress
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const st = stepStates[s.key]
            const cls = stateClasses(st)
            const disabled = st === 'future'
            const onClick = () => {
              if (!onStepClick) return
              if (disabled) return
              onStepClick(s.key, st)
            }
            return (
              <div key={s.key} className="flex-1 flex flex-col items-center relative z-10">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 h-0.5 w-full ${cls.line}`}
                    style={{ width: 'calc(100% - 40px)', marginLeft: '20px' }}
                  />
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onClick}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white shadow-lg relative z-20 transition ${
                    cls.dot
                  } ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:scale-105'}`}
                  aria-disabled={disabled}
                  aria-label={`${s.label} (${st})`}
                >
                  {st === 'done' ? <FiCheckCircle className="text-sm" /> : <FiClock className="text-sm" />}
                </button>
                <div className={`text-xs text-center font-semibold max-w-[140px] ${cls.text}`}>{s.label}</div>
                <div className="text-[11px] text-center text-gray-600 max-w-[140px]">{s.sub}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

