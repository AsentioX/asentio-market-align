import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
    >
      {children}
    </button>
  );
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3 text-gray-700',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton title="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
