import { useEffect, useState } from "react";
import { Extension, Node, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { safeImageSrc } from "../../utils/chapter-paragraphs";

// Tiptap extensions for chapter format v1 (backend #74), so the web editor reads and writes what the app's editor does:
// a paragraph's kind (text, center, quote), scene breaks and pictures with captions. What getHTML() gives is what the
// server stores, written the way it reads it back, so loading and saving an unchanged chapter changes nothing.

const BLOCK_KINDS = ["center", "quote"];

/**
 * A paragraph's kind as the attribute `kind` ("text", "center", "quote"), read from and written to `data-kind`.
 * Pressing Enter keeps the kind (a poem's next line, a letter's next paragraph); the toolbar turns it back to text.
 */
export const ParagraphKind = Extension.create({
  name: "paragraphKind",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          kind: {
            default: "text",
            keepOnSplit: true,
            parseHTML: (element) => {
              const kind = (element.getAttribute("data-kind") || "").toLowerCase();
              return BLOCK_KINDS.includes(kind) ? kind : "text";
            },
            renderHTML: (attributes) =>
              BLOCK_KINDS.includes(attributes.kind) ? { "data-kind": attributes.kind } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphKind:
        (kind) =>
        ({ commands }) =>
          commands.updateAttributes("paragraph", { kind: BLOCK_KINDS.includes(kind) ? kind : "text" }),
      toggleParagraphKind:
        (kind) =>
        ({ editor, commands }) =>
          commands.updateAttributes("paragraph", {
            kind: editor.isActive("paragraph", { kind }) ? "text" : kind,
          }),
    };
  },
});

/** A scene break: `<hr>` (or the stored `<p data-kind="break">`), shown as «* * *». */
export const SceneBreak = Node.create({
  name: "sceneBreak",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [{ tag: "hr" }, { tag: 'p[data-kind="break" i]', priority: 100 }];
  },

  renderHTML() {
    return ["hr", { class: "sard-scene-break" }];
  },

  renderText() {
    return "\n";
  },

  addCommands() {
    return {
      insertSceneBreak:
        () =>
        ({ chain }) =>
          chain()
            .insertContent([{ type: this.name }, { type: "paragraph" }])
            .run(),
    };
  },
});

// <p data-kind="image"><img src="…">caption</p> with exactly one picture, or a <p> holding one picture and no words, or a
// bare <img>: a picture whose address the site can load. Anything else is not a picture (a paragraph's rule reads it).
const pictureFromParagraph = (element, requireKind) => {
  const images = element.querySelectorAll("img");
  if (images.length !== 1) return false;
  const src = safeImageSrc(images[0].getAttribute("src"));
  if (!src) return false;
  const caption = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (!requireKind && caption) return false;
  return { src, caption: caption || null };
};

const ChapterImageView = ({ node, updateAttributes, deleteNode, selected, editor }) => {
  const [caption, setCaption] = useState(node.attrs.caption ?? "");
  const [failed, setFailed] = useState(false);
  const editable = editor?.isEditable;

  // Undo/redo can change the caption under the field.
  useEffect(() => {
    setCaption(node.attrs.caption ?? "");
  }, [node.attrs.caption]);

  const commitCaption = (value) => {
    const next = value.replace(/\s+/g, " ").trim() || null;
    if (next !== (node.attrs.caption ?? null)) {
      updateAttributes({ caption: next });
    }
  };

  return (
    <NodeViewWrapper
      as="figure"
      className={`sard-chapter-image group relative my-4 flex flex-col items-center gap-2 rounded-xl p-2 ${
        selected ? "ring-2 ring-[#4A9EFF]" : ""
      }`}
      data-drag-handle=""
      contentEditable={false}
    >
      {failed ? (
        <div className="w-full rounded-lg border border-dashed border-gray-500 py-8 text-center text-sm text-gray-400 noto-sans-arabic-medium">
          تعذّر تحميل الصورة
        </div>
      ) : (
        <img
          src={node.attrs.src}
          alt={node.attrs.caption || "صورة من الفصل"}
          className="block max-h-[60vh] max-w-full rounded-lg"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
      {editable ? (
        <input
          type="text"
          dir="auto"
          value={caption}
          maxLength={300}
          placeholder="أضف تعليقًا توضيحيًا للصورة (اختياري)"
          onChange={(event) => setCaption(event.target.value)}
          onBlur={(event) => commitCaption(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitCaption(event.currentTarget.value);
              editor.commands.focus();
            }
          }}
          className="w-full max-w-md rounded-lg border border-transparent bg-transparent px-2 py-1 text-center text-sm text-gray-500 placeholder:text-gray-500/70 focus:border-[#4A9EFF] focus:outline-none dark:text-gray-300 noto-sans-arabic-medium"
          aria-label="التعليق التوضيحي للصورة"
        />
      ) : (
        node.attrs.caption && <figcaption className="text-center text-sm text-gray-400">{node.attrs.caption}</figcaption>
      )}
      {editable && (
        <button
          type="button"
          onClick={() => deleteNode()}
          className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 focus:opacity-100 group-hover:opacity-100"
          aria-label="حذف الصورة"
          title="حذف الصورة"
        >
          <Trash2 size={16} />
        </button>
      )}
    </NodeViewWrapper>
  );
};

/** A picture paragraph: its https address (from POST /api/novel/{novelId}/chapter-images) and an optional caption. */
export const ChapterImage = Node.create({
  name: "chapterImage",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      caption: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: 'p[data-kind="image" i]', priority: 100, getAttrs: (element) => pictureFromParagraph(element, true) },
      { tag: "p", priority: 90, getAttrs: (element) => pictureFromParagraph(element, false) },
      {
        tag: "img[src]",
        getAttrs: (element) => {
          const src = safeImageSrc(element.getAttribute("src"));
          return src ? { src, caption: null } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const picture = ["img", { src: node.attrs.src }];
    return node.attrs.caption
      ? ["p", { "data-kind": "image" }, picture, node.attrs.caption]
      : ["p", { "data-kind": "image" }, picture];
  },

  renderText({ node }) {
    return node.attrs.caption ? `\n${node.attrs.caption}\n` : "\n";
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChapterImageView);
  },

  addCommands() {
    return {
      insertChapterImage:
        ({ src, caption = null }) =>
        ({ chain }) => {
          const safe = safeImageSrc(src);
          if (!safe) return false;
          return chain()
            .insertContent([{ type: this.name, attrs: { src: safe, caption } }, { type: "paragraph" }])
            .run();
        },
    };
  },
});
