'use client'

import type { ReactNode } from 'react'
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCompass,
  FiEye,
  FiBook,
  FiLayers,
  FiUsers,
  FiShield,
  FiSearch,
  FiSave,
  FiBell,
  FiUpload,
  FiClock,
  FiHelpCircle,
  FiTrash2,
} from 'react-icons/fi'

interface HowItWorksProps {
  onGoHome: () => void
  onSignIn: () => void
  onSignUp: () => void
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: any
  children: ReactNode
}) {
  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-white/60">
      <div className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
        <Icon className="text-primary-700" />
        {title}
      </div>
      <div className="text-gray-800">{children}</div>
    </div>
  )
}

function Step({ title, body }: { title: string; body: ReactNode }) {
  return (
    <li className="flex gap-3">
      <FiCheckCircle className="mt-1 flex-shrink-0 text-primary-600" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-gray-600">{body}</div>
      </div>
    </li>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-gray-50 text-gray-700 border-gray-200">
      {children}
    </span>
  )
}

export default function HowItWorks({ onGoHome, onSignIn, onSignUp }: HowItWorksProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-purple-50">
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto w-full max-w-6xl">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={onGoHome} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold">
              <FiArrowLeft />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onSignUp}
                className="bg-white/80 hover:bg-white backdrop-blur-md text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all border border-white/70 shadow-sm hover:shadow-md"
              >
                Sign Up
              </button>
              <button
                onClick={onSignIn}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-2 px-4 rounded-lg transition-all border border-white/30 shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Hero */}
          <div className="rounded-3xl p-8 md:p-10 mb-8 bg-white/85 backdrop-blur-md shadow-xl border border-white/60">
            <div className="max-w-4xl">
              <div className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiCompass />
                How It Works
              </div>
              <h1 className="text-4xl md:text-5xl font-bold italic tracking-tight text-gray-900 mb-5">
                Same Thing Only Different Community
              </h1>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                This app is a repository of <span className="font-semibold">core principles</span> and a workflow for drafting,
                collaborating, and submitting new principles for <span className="font-semibold">Moderator review</span>. Use it to spot patterns,
                apply universal truths, and turn learning into repeatable decisions.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Pill>Search</Pill>
                <Pill>Favourites</Pill>
                <Pill>Propose</Pill>
                <Pill>Collaborate</Pill>
                <Pill>Inbox</Pill>
                <Pill>Review</Pill>
              </div>

              <div className="mt-5 text-sm text-gray-600">
                Demo note: drafts, collaboration, notifications, and history are stored in <span className="font-semibold">localStorage</span> (no backend yet).
                It’s a realistic workflow simulation.
              </div>
            </div>
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Section title="App map (what each tab does)" icon={FiLayers}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiSearch className="text-primary-700" />
                      Search
                    </div>
                    <div className="text-gray-600 mt-2">
                      Discover principles. Open any card to read in the Advanced Reader. Use filters to narrow by category/author. Use{' '}
                      <span className="font-semibold">Not interested</span> to hide items from your feed.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiSave className="text-primary-700" />
                      Favourites
                    </div>
                    <div className="text-gray-600 mt-2">
                      Your saved list. Use <span className="font-semibold">Add to Favourites</span> on a card to keep it handy.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiUpload className="text-primary-700" />
                      Propose
                    </div>
                    <div className="text-gray-600 mt-2">
                      Draft a new principle. Move it through Draft → Collaborate (optional) → Submit. Archive/Delete are managed inside the draft’s{' '}
                      <span className="font-semibold">Danger zone</span>.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiUsers className="text-primary-700" />
                      Collaborate
                    </div>
                    <div className="text-gray-600 mt-2">
                      Browse drafts open to collaborators, request access, and participate by creating <span className="font-semibold">Suggestions</span>.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiBell className="text-primary-700" />
                      Inbox
                    </div>
                    <div className="text-gray-600 mt-2">
                      Your notifications: invites, access requests, suggestion activity, comments, applies/declines, and stage transitions.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiShield className="text-primary-700" />
                      Review
                    </div>
                    <div className="text-gray-600 mt-2">
                      Moderators/Admins review submissions and annotations. They also have a <span className="font-semibold">Drafts</span> oversight view.
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="The drafting workflow (end-to-end)" icon={FiUpload}>
                <div className="text-sm text-gray-700 mb-4">This is the core experience for creating new principles:</div>

                <ol className="space-y-4 text-gray-800">
                  <Step
                    title="1) Draft (Owner edits)"
                    body={
                      <>
                        Create a draft and fill in title/category/description/take-home/full text/hard questions. Owner edits are tracked in the{' '}
                        <span className="font-semibold">Activity Timeline</span>.
                      </>
                    }
                  />
                  <Step
                    title="2) Collaborate (Optional)"
                    body={
                      <>
                        Invite collaborators or open the draft to requests. Collaborators propose per-field changes via{' '}
                        <span className="font-semibold">Suggestions</span>. The owner reviews and chooses{' '}
                        <span className="font-semibold">Apply</span> or <span className="font-semibold">Decline</span>.
                      </>
                    }
                  />
                  <Step
                    title="3) Submit (Owner only)"
                    body={
                      <>
                        The owner marks the draft <span className="font-semibold">Ready to Submit</span>, then submits it for Moderator review. The transition is logged in the timeline.
                      </>
                    }
                  />
                  <Step
                    title="4) Moderator Review"
                    body={
                      <>
                        Moderators review the submission and advance the workflow. They can also monitor all in-progress drafts via{' '}
                        <span className="font-semibold">Review → Drafts</span>.
                      </>
                    }
                  />
                  <Step title="5) Publish" body={<>After review, the principle becomes part of the published set (Core Principles).</>} />
                </ol>

                <div className="mt-5 p-4 rounded-2xl bg-primary-50 border border-primary-100 text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">Key concept</div>
                  <div className="mt-1">
                    The <span className="font-semibold">Activity Timeline</span> is the shared source of truth: owner edits, suggestions, comments,
                    applies/declines, and stage transitions.
                  </div>
                </div>
              </Section>

              <Section title="Collaboration (Suggestions, comments, watching, Inbox)" icon={FiUsers}>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Suggestions (GitHub-lite)</div>
                    <div className="mt-2">
                      Collaborators propose a change to a single field (title/category/description/take-home/full text/hard questions). The owner edits directly in Draft; collaborators use suggestions.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Apply / Decline</div>
                    <div className="mt-2">
                      Owners review suggestions and choose Apply (updates the draft) or Decline (keeps current value). Outcomes are recorded in the timeline and can notify watchers.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Comments</div>
                    <div className="mt-2">Each suggestion has a discussion thread to clarify intent and capture rationale.</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Watching + Inbox</div>
                    <div className="mt-2">
                      Watch a draft to receive Inbox notifications for invites, access requests, suggestion activity, comments, applies/declines, owner edits, and stage changes.
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Reading & saving (Search, Favourites, Not interested)" icon={FiBook}>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Open to read</div>
                    <div className="mt-2">Click any principle card to open it in the Advanced Reader for deeper reading and navigation.</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Add to Favourites</div>
                    <div className="mt-2">Use Add to Favourites to build your personal recall list.</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Not interested (hide from Search)</div>
                    <div className="mt-2">
                      Use the kebab menu on a card to hide it from your Search feed. Undo immediately via the toast, or manage hidden items using{' '}
                      <span className="font-semibold">Hidden</span> on Search.
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="FAQ (practical + honest)" icon={FiHelpCircle}>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="p-4 rounded-2xl bg-white border border-gray-200">
                    <div className="font-semibold text-gray-900">Where do I edit a principle?</div>
                    <div className="mt-2">
                      Drafts are edited inside <span className="font-semibold">Propose</span>. Published content is meant for reading and saving. Moderators/Admins handle review actions in Review.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200">
                    <div className="font-semibold text-gray-900">Where do I archive or delete a draft?</div>
                    <div className="mt-2">
                      Inside the draft’s <span className="font-semibold">Danger zone</span>. Archived drafts can be restored; permanent delete cannot be undone. Submitted-for-review drafts have guardrails.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200">
                    <div className="font-semibold text-gray-900">Is this real multi-user collaboration?</div>
                    <div className="mt-2">
                      It’s a demo simulation using localStorage (no backend yet). The UX mirrors real collaboration patterns so we can validate the workflow before wiring a backend.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200">
                    <div className="font-semibold text-gray-900">How do notifications work?</div>
                    <div className="mt-2">
                      Notifications persist per user in localStorage. The Inbox shows unread counts and lets you jump to the relevant draft/workflow step.
                    </div>
                  </div>
                </div>
              </Section>
            </div>

            <div className="space-y-6">
              <Section title="Roles (current demo behavior)" icon={FiShield}>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiEye />
                      Non-subscriber
                    </div>
                    <div className="mt-2 text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Browse and read principles (some content may be gated depending on demo settings)</li>
                        <li>Create drafts (some collaboration actions may be disabled)</li>
                        <li>Upgrade prompts appear where collaboration/tools are locked</li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiBook />
                      Subscriber
                    </div>
                    <div className="mt-2 text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Collaborate on drafts: request access, create suggestions, comment, and watch drafts</li>
                        <li>Use Inbox updates for collaboration flow</li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiShield />
                      Moderator
                    </div>
                    <div className="mt-2 text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Review submissions and annotations</li>
                        <li>See all drafts in Review → Drafts (oversight)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiUsers />
                      Admin
                    </div>
                    <div className="mt-2 text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Everything Moderators can do</li>
                        <li>User management controls (demo)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Troubleshooting (demo/localStorage)" icon={FiClock}>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="font-semibold text-gray-900">I don’t see my changes</div>
                    <div className="mt-1">Refresh the page. Drafts/notifications are stored locally and the UI uses lightweight refresh loops.</div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="font-semibold text-gray-900">I hid a principle by mistake</div>
                    <div className="mt-1">
                      Use the Undo toast, or open <span className="font-semibold">Hidden</span> on Search to restore it.
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="font-semibold text-gray-900">Archive vs delete</div>
                    <div className="mt-1">Archive is reversible; delete is permanent. Drafts submitted for review have extra guardrails.</div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiTrash2 />
                      Resetting the demo
                    </div>
                    <div className="mt-1">Clearing browser localStorage resets drafts/notifications for this demo environment.</div>
                  </div>
                </div>
              </Section>

              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-white/60">
                <div className="text-gray-900 font-bold text-xl mb-1">Ready to jump in?</div>
                <div className="text-gray-700">Sign in with a demo role, or use Sign Up (demo) to see the onboarding flow.</div>
                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={onSignIn}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-2 px-4 rounded-lg transition-all border border-white/30 shadow-md hover:shadow-lg"
                  >
                    Sign In <FiArrowRight className="inline ml-2" />
                  </button>
                  <button
                    onClick={onSignUp}
                    className="bg-white/80 hover:bg-white backdrop-blur-md text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all border border-white/70 shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <FiShield />
            Your data in this demo is stored locally in your browser.
          </div>
        </div>
      </div>
    </div>
  )
}

