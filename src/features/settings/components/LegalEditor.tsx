import type { IJodit } from 'jodit/esm/types'
import JoditEditor from 'jodit-react'
import 'jodit/es2021/jodit.min.css'
import { useMemo, useRef } from 'react'

const baseConfig = {
  height: 380,
  toolbarAdaptive: false,
  toolbarSticky: false,
  statusbar: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  buttons: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    '|',
    'ul',
    'ol',
    '|',
    'paragraph',
    'fontsize',
    '|',
    'link',
    '|',
    'align',
    'indent',
    'outdent',
    '|',
    'undo',
    'redo',
    'eraser',
    'source',
  ],
}

interface LegalEditorProps {
  value: string
  label: string
  onReady: (read: () => string) => void
}

export function LegalEditor({ value, label, onReady }: LegalEditorProps) {
  const latest = useRef(value)
  const config = useMemo(
    () => ({
      ...baseConfig,
      placeholder: label,
    }),
    [label],
  )

  const remember = (html: string) => {
    latest.current = html
  }

  return (
    <div className="legal-editor">
      <JoditEditor
        value={value}
        config={config}
        editorRef={(editor: IJodit) => {
          onReady(() => editor.value || latest.current)
        }}
        onChange={remember}
        onBlur={remember}
      />
    </div>
  )
}
