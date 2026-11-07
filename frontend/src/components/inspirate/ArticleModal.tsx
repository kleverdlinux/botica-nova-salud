import React from 'react';
import { X, Calendar, Tag } from 'lucide-react';
import { Article, ARTICLES } from '../../data/inspirateData';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectArticle,
}) => {
  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white shadow-2xl p-6 sm:p-10 my-auto rounded-lg text-[#222222] border border-gray-100 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer z-20 shadow-xs"
          aria-label="Cerrar artículo"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Article Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-[#a6a9ad] mb-2">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> {article.tag}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {article.date}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#222222] leading-tight">
            {article.title}
          </h2>
        </div>

        {/* Feature Image */}
        <div className="w-full h-64 sm:h-80 bg-[#f4f4f4] overflow-hidden mb-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Paragraphs */}
        <div className="prose max-w-none space-y-4 text-sm sm:text-base text-[#444444] leading-relaxed mb-10">
          {article.content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Other articles preview */}
        <div className="pt-8 border-t border-gray-100">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#0d9488] block mb-4">
            Otras guías y consejos de salud Botica Nova Salud
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ARTICLES.filter((a) => a.id !== article.id).map((other) => (
              <div
                key={other.id}
                onClick={() => onSelectArticle(other)}
                className="p-3 border border-gray-100 bg-[#fafafa] hover:bg-gray-100 transition-colors cursor-pointer flex gap-3 items-center"
              >
                <img
                  src={other.image}
                  alt={other.title}
                  className="w-14 h-14 object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#888888] font-bold uppercase block">
                    {other.date}
                  </span>
                  <h4 className="text-xs font-black uppercase text-[#222222] truncate">
                    {other.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
