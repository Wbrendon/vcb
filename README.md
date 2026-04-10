# VCB Studio

Ferramenta interna de geração de ilustrações de personagens via IA.

## Stack

- **Next.js 15** — App Router + API Routes
- **OpenAI gpt-image-1** — Geração de imagem
- **Tailwind CSS** — Estilização
- **TypeScript** — Tipagem

## Fluxo

```
Prompt (character_description)
        ↓
Style Template (JSON lock de estilo)
        ↓
OpenAI gpt-image-1 → PNG
        ↓
Download PNG
        ↓
Figma Plugin (Vectorizer / Vectorize) → SVG
```

## Setup

```bash
npm install
cp .env.example .env.local
# Adicionar OPENAI_API_KEY no .env.local
npm run dev
```

## Estrutura

```
vcb/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # POST — gera imagem via OpenAI
│   │   └── styles/route.ts     # GET  — lista estilos disponíveis
│   └── page.tsx
├── components/
│   └── generator/
│       └── Generator.tsx       # Interface principal
├── lib/
│   └── styles.ts               # Prompt templates e style configs
├── types/
│   └── index.ts                # Tipos TypeScript
└── public/
    └── references/             # Imagens de referência de estilo
```

## Adicionando novos estilos

Edite `lib/styles.ts` e adicione um novo objeto em `CHARACTER_STYLES`.

## Vetorização no Figma

1. Gerar e baixar o PNG
2. Abrir Figma → plugin Vectorizer ou Vectorize
3. Importar PNG → exportar SVG

## Próximos passos

- [ ] Upload de imagens de referência (few-shot)
- [ ] Sistema de colaboradores
- [ ] Galeria de assets gerados
- [ ] Integração Figma API
