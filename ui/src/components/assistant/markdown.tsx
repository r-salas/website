//
//
//  Markdown
//
//  Renders assistant replies (GitHub-flavored, single newlines as <br>) with
//  chat-bubble-friendly spacing.
//

import { cn } from 'cn'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

const components: Components = {
    p: ({ className, ...props }) => <p className={cn('mb-2 last:mb-0', className)} {...props} />,
    ul: ({ className, ...props }) => <ul className={cn('mb-2 list-disc space-y-1 pl-5 last:mb-0', className)} {...props} />,
    ol: ({ className, ...props }) => <ol className={cn('mb-2 list-decimal space-y-1 pl-5 last:mb-0', className)} {...props} />,
    li: ({ className, ...props }) => <li className={cn('pl-0.5', className)} {...props} />,
    a: ({ className, ...props }) => <a className={cn('underline underline-offset-2 hover:no-underline', className)} target="_blank" rel="noreferrer" {...props} />,
    strong: ({ className, ...props }) => <strong className={cn('font-semibold', className)} {...props} />,
    h1: ({ className, ...props }) => <h1 className={cn('mb-2 text-base font-semibold last:mb-0', className)} {...props} />,
    h2: ({ className, ...props }) => <h2 className={cn('mb-2 text-base font-semibold last:mb-0', className)} {...props} />,
    h3: ({ className, ...props }) => <h3 className={cn('mb-2 text-sm font-semibold last:mb-0', className)} {...props} />,
    blockquote: ({ className, ...props }) => <blockquote className={cn('border-current/30 mb-2 border-l-2 pl-3 opacity-90 last:mb-0', className)} {...props} />,
    code: ({ className, ...props }) => <code className={cn('bg-current/10 rounded px-1 py-0.5 text-[0.85em]', className)} {...props} />,
    pre: ({ className, ...props }) => <pre className={cn('bg-current/10 mb-2 overflow-x-auto rounded-lg p-2.5 text-[0.85em] last:mb-0', className)} {...props} />,
    hr: ({ className, ...props }) => <hr className={cn('border-current/20 my-3', className)} {...props} />,
    table: ({ className, ...props }) => <table className={cn('mb-2 w-full border-collapse text-sm last:mb-0', className)} {...props} />,
    th: ({ className, ...props }) => <th className={cn('border-current/20 border px-2 py-1 text-left font-semibold', className)} {...props} />,
    td: ({ className, ...props }) => <td className={cn('border-current/20 border px-2 py-1', className)} {...props} />,
}

function Markdown({ children }: { children: string }) {
    return <div className="[&_pre_code]:bg-transparent [&_pre_code]:p-0">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
            {children}
        </ReactMarkdown>
    </div>
}

export default Markdown
