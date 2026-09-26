//
//
//  App
//
//

import ProfilePanel from '@/components/profile-panel'
import ChatPanel from '@/components/chat-panel'


function App() {
    return <div className="bg-muted/30 min-h-svh lg:h-svh lg:overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
            <aside className="lg:w-[340px] lg:shrink-0 lg:overflow-y-auto lg:overscroll-contain">
                <ProfilePanel />
            </aside>

            <main className="flex min-h-0 min-w-0 flex-1 flex-col">
                <ChatPanel />
            </main>
        </div>
    </div>
}

export default App
