import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers,
  Star,
  Target,
  Calculator,
  Globe,
  Leaf,
  Palette,
  Heart,
  Code,
  DollarSign,
  Users,
  Search,
  Bell,
  HelpCircle,
  Settings,
  Grid,
  Info,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

// ── Curriculum Data ─────────────────────────────────────────────────────────
const CURRICULUM = {
  "Grade R": {
    phase: "Foundation Phase",
    phaseColor: "#00875a",
    phaseLight: "#e3fcef",
    phaseBorder: "#abf5d1",
    description:
      "Grade R (Reception Year) lays the foundation for lifelong learning through play-based, structured activities aligned to South Africa's CAPS framework.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Listening and Speaking — oral vocabulary, rhymes, songs, storytelling",
          "Phonological Awareness — identifying sounds, syllables, rhyming words",
          "Emergent Reading — print awareness, picture books, big books",
          "Emergent Writing — pre-writing patterns, letter formation",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Numbers, Operations & Relationships — counting 1–10, number recognition",
          "Patterns, Functions & Algebra — simple repeating patterns",
          "Space & Shape — 2D shapes, positional language (in, on, under)",
          "Measurement — comparing length, mass, capacity informally",
        ],
      },
      {
        name: "Life Skills",
        icon: Heart,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Beginning Knowledge — self, family, community, seasons",
          "Creative Arts — drawing, painting, music, movement, drama",
          "Physical Education — gross motor skills, basic movement",
          "Personal & Social Wellbeing — hygiene, safety, emotions",
        ],
      },
    ],
  },
  "Grade 1": {
    phase: "Foundation Phase",
    phaseColor: "#00875a",
    phaseLight: "#e3fcef",
    phaseBorder: "#abf5d1",
    description:
      "Grade 1 introduces formal literacy and numeracy. Learners develop reading and writing skills while exploring the world around them through Life Skills.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Listening & Speaking — instructions, discussions, oral sentences",
          "Phonics & Word Recognition — letter sounds, blending, sight words",
          "Reading & Comprehension — graded readers, predicting, retelling",
          "Writing — sentences, capitalization, full stops",
          "Language Structures — nouns, verbs, simple punctuation",
        ],
      },
      {
        name: "First Additional Language",
        icon: Globe,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Listening — songs, rhymes, classroom instructions",
          "Speaking — greetings, basic vocabulary, short responses",
          "Reading — simple words and sentences",
          "Writing — copying words, labeling pictures",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Numbers 0–100 — counting, ordering, place value (tens & units)",
          "Addition & Subtraction — number bonds to 10, basic operations",
          "Patterns — number patterns, geometric patterns",
          "Space & Shape — 2D and 3D shapes, symmetry",
          "Measurement — length, mass, capacity, time (days of week)",
          "Data Handling — sorting, simple bar graphs",
        ],
      },
      {
        name: "Life Skills",
        icon: Heart,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Beginning Knowledge — living/non-living things, weather, transport",
          "Creative Arts — visual art, music, drama, movement",
          "Physical Education — throwing, catching, team games",
          "Personal & Social Well-being — self-confidence, friendships, safety",
        ],
      },
    ],
  },
  "Grade 2": {
    phase: "Foundation Phase",
    phaseColor: "#00875a",
    phaseLight: "#e3fcef",
    phaseBorder: "#abf5d1",
    description:
      "Grade 2 consolidates reading fluency and introduces multiplication concepts. Learners begin writing paragraphs and explore their immediate environment.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Reading Fluency — reading with expression, punctuation, phrasing",
          "Comprehension — literal, inferential, vocabulary questions",
          "Writing — paragraphs, personal recounts, simple stories",
          "Language Structures — adjectives, pronouns, tenses",
          "Spelling & Phonics — word families, prefixes/suffixes",
        ],
      },
      {
        name: "First Additional Language",
        icon: Globe,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Oral — conversations, telling stories, describing pictures",
          "Reading — simple paragraphs, vocabulary in context",
          "Writing — short sentences, guided writing tasks",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Numbers to 200 — expanded notation, comparing & ordering",
          "Multiplication & Division — grouping, sharing, tables of 2, 5, 10",
          "Fractions — halves, quarters, thirds",
          "Geometry — properties of 2D/3D shapes",
          "Measurement — centimetres, litres, grams, calendar & clocks",
          "Data Handling — pictographs, bar graphs",
        ],
      },
      {
        name: "Life Skills",
        icon: Heart,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Beginning Knowledge — plants, animals, food, community helpers",
          "Creative Arts — sketching, clay, rhythm, songs, role-play",
          "Physical Education — athletics, swimming basics, games",
          "Well-being — conflict resolution, diversity & belonging",
        ],
      },
    ],
  },
  "Grade 3": {
    phase: "Foundation Phase",
    phaseColor: "#00875a",
    phaseLight: "#e3fcef",
    phaseBorder: "#abf5d1",
    description:
      "Grade 3 is the final Foundation Phase year. Learners consolidate all early literacy/numeracy skills and prepare for the transition to the Intermediate Phase.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Reading — longer texts, comprehension strategies, genre awareness",
          "Writing — recounts, descriptions, imaginative stories, instructions",
          "Grammar — sentence types, punctuation, parts of speech",
          "Spelling — homophones, compound words, word building",
          "Handwriting — cursive introduction, presentation",
        ],
      },
      {
        name: "First Additional Language",
        icon: Globe,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Listening — longer oral texts, following multi-step instructions",
          "Speaking — discussion, presentations, debates",
          "Reading — paragraphs, simple poems, captions",
          "Writing — short paragraphs, labelling, simple recounts",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Numbers to 999 — place value, rounding, estimation",
          "All Four Operations — addition, subtraction, multiplication, division",
          "Fractions — comparing & ordering ½, ¼, ⅓, ⅕",
          "Money — SA coins & notes, change calculations",
          "Geometry — angles (right angle), lines of symmetry",
          "Measurement — perimeter, mass, capacity, time",
          "Data Handling — pie charts, tally tables",
        ],
      },
      {
        name: "Life Skills",
        icon: Heart,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Beginning Knowledge — the environment, weather, simple science",
          "Technology — everyday tools and simple machines",
          "Creative Arts — art appreciation, rhythm & melody, performance",
          "Physical Education — sport techniques, team work",
          "Well-being — puberty awareness, goal setting",
        ],
      },
    ],
  },
  "Grade 4": {
    phase: "Intermediate Phase",
    phaseColor: "#0747a6",
    phaseLight: "#deebff",
    phaseBorder: "#4c9aff",
    description:
      "Grade 4 marks the transition to the Intermediate Phase. Learners experience a broadened curriculum with 8 subjects and more demanding content across all areas.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Reading — novels, information texts, poetry, newspapers",
          "Comprehension — main idea, inference, text structure",
          "Writing — essays, formal letters, narratives, reports",
          "Grammar — clauses, complex sentences, direct & indirect speech",
        ],
      },
      {
        name: "First Additional Language",
        icon: Globe,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Oral — debates, presentations, discussions",
          "Reading — short stories, advertisements, infographics",
          "Writing — e-mails, diary entries, summaries",
          "Grammar — tenses, modal verbs, conjunctions",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Whole Numbers to 9 999 — operations, factors, multiples, primes",
          "Common Fractions — equivalent fractions, addition/subtraction",
          "Decimals — tenths & hundredths",
          "Geometry — angles (acute, obtuse, reflex), properties of shapes",
          "Measurement — area, perimeter, volume, conversions",
          "Data Handling — mean, mode, median, range",
        ],
      },
      {
        name: "Natural Sciences & Technology",
        icon: Leaf,
        accent: "#00875a",
        light: "#e3fcef",
        topics: [
          "Life & Living — ecosystems, food chains, habitats",
          "Matter & Materials — properties of materials, mixtures",
          "Energy & Change — forces, magnets, sound & light",
          "Technology — design process, structures & mechanisms",
        ],
      },
      {
        name: "Social Sciences",
        icon: Users,
        accent: "#ff8b00",
        light: "#fffae6",
        topics: [
          "History — early SA societies, San people, Khoikhoi",
          "Geography — maps, Africa's physical features",
          "History — colonisation, missionary schools",
        ],
      },
      {
        name: "Creative Arts",
        icon: Palette,
        accent: "#ae1c3e",
        light: "#ffecf0",
        topics: [
          "Visual Arts — drawing techniques, colour theory",
          "Music — notation basics, voice & body percussion",
          "Drama — mime, improvisation",
          "Dance — African dance forms, choreography",
        ],
      },
      {
        name: "Economic & Management Sciences",
        icon: DollarSign,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "The Economy — needs vs wants, goods & services",
          "Business — small business concepts, budgeting",
          "Financial Literacy — saving, spending, SA economy",
        ],
      },
      {
        name: "Life Skills",
        icon: Heart,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Physical Education — athletics, swimming, games",
          "Personal & Social Well-being — peer pressure, resilience",
          "Health — hygiene, nutrition, diseases",
        ],
      },
    ],
  },
  "Grade 5": {
    phase: "Intermediate Phase",
    phaseColor: "#0747a6",
    phaseLight: "#deebff",
    phaseBorder: "#4c9aff",
    description:
      "Grade 5 deepens the Intermediate Phase curriculum with more complex texts, algebraic thinking, and South African history including pre-colonial to colonial eras.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Reading — literature circles, persuasive texts, visual texts",
          "Writing — argumentative writing, minutes, advertisements",
          "Grammar — complex & compound sentences, reported speech",
          "Vocabulary — idioms, figurative language",
        ],
      },
      {
        name: "First Additional Language",
        icon: Globe,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Oral — role play, interviews, listening activities",
          "Reading — articles, short stories, recounts",
          "Writing — formal & informal letters, recounts",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Whole Numbers to 99 999 — LCM, HCF, prime factorisation",
          "Fractions & Decimals — multiply/divide fractions, percentages",
          "Ratio & Rate — comparing quantities",
          "Algebraic Thinking — input/output tables, number sentences",
          "Geometry — transformations (reflection, rotation, translation)",
          "Measurement — area of complex shapes, capacity & volume",
          "Probability — likelihood, simple experiments",
        ],
      },
      {
        name: "Natural Sciences & Technology",
        icon: Leaf,
        accent: "#00875a",
        light: "#e3fcef",
        topics: [
          "Life & Living — cells, skeletal & muscular systems",
          "Matter & Materials — chemical changes, solutions",
          "Energy & Change — electricity basics, simple circuits",
          "Technology — levers & pulleys, design challenges",
        ],
      },
      {
        name: "Social Sciences",
        icon: Users,
        accent: "#ff8b00",
        light: "#fffae6",
        topics: [
          "History — Great Zimbabwe, Indian Ocean trade, slave trade",
          "Geography — climate zones, biomes, SA's physical geography",
          "History — early European contact with southern Africa",
        ],
      },
      {
        name: "Creative Arts",
        icon: Palette,
        accent: "#ae1c3e",
        light: "#ffecf0",
        topics: [
          "Visual Arts — perspective drawing, collage, printmaking",
          "Music — reading notation, part singing",
          "Drama — script writing, performance techniques",
          "Dance — contemporary forms, composition",
        ],
      },
      {
        name: "Economic & Management Sciences",
        icon: DollarSign,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Economic Systems — market economy vs command economy",
          "Entrepreneurship — business plans, profit & loss",
          "Financial Literacy — interest, loans, bank accounts",
        ],
      },
      {
        name: "Life Skills",
        icon: Heart,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Physical Education — team sports, athletics, fitness",
          "Personal & Social Well-being — puberty, relationships",
          "Health — substance abuse awareness, road safety",
        ],
      },
    ],
  },
  "Grade 6": {
    phase: "Intermediate Phase",
    phaseColor: "#0747a6",
    phaseLight: "#deebff",
    phaseBorder: "#4c9aff",
    description:
      "Grade 6 is the final Intermediate Phase year. Learners consolidate all skills and prepare for the rigour of the Senior Phase with more formal assessment and independent work.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Reading — novels, poetry analysis, non-fiction texts",
          "Writing — research essays, creative writing, reviews",
          "Grammar — passive voice, modal verbs, paragraph structure",
          "Literature — setting, character, theme, conflict",
        ],
      },
      {
        name: "First Additional Language",
        icon: Globe,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Oral — transactional language, debates, scripted performances",
          "Reading — extended texts, visual interpretation",
          "Writing — formal reports, formal letters, summaries",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Numbers to 999 999 — exponents, square roots",
          "Fractions, Decimals & Percentages — all operations",
          "Algebra — expressions, equations, substitution",
          "Functions & Relationships — flow diagrams, tables, graphs",
          "Geometry — construction with compass & ruler, angles in polygons",
          "Data Handling — scatter plots, stem & leaf, outliers",
        ],
      },
      {
        name: "Natural Sciences & Technology",
        icon: Leaf,
        accent: "#00875a",
        light: "#e3fcef",
        topics: [
          "Life & Living — photosynthesis, reproduction in plants & animals",
          "Matter & Materials — separating mixtures, periodic table intro",
          "Energy & Change — sound, light, heat transfer",
          "Technology — gears, structures, design evaluation",
        ],
      },
      {
        name: "Social Sciences",
        icon: Users,
        accent: "#ff8b00",
        light: "#fffae6",
        topics: [
          "History — colonisation of the Cape, VOC, settler impact",
          "History — resistance & responses by indigenous people",
          "Geography — SA's provinces, resources, population distribution",
          "Geography — climate, rivers, human impact on environment",
        ],
      },
      {
        name: "Creative Arts",
        icon: Palette,
        accent: "#ae1c3e",
        light: "#ffecf0",
        topics: [
          "Visual Arts — portrait, landscape, mixed media",
          "Music — composition, improvisation, history of music genres",
          "Drama — full scripted production",
          "Dance — choreography, performing for an audience",
        ],
      },
      {
        name: "Economic & Management Sciences",
        icon: DollarSign,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Business Operations — marketing mix (4 Ps)",
          "Production — inputs, outputs, factors of production",
          "Financial Literacy — taxation basics, VAT, budgets",
        ],
      },
      {
        name: "Life Skills",
        icon: Heart,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Physical Education — fitness testing, aerobics, sport codes",
          "Well-being — gender identity, values, career awareness",
          "Health — HIV/AIDS awareness, reproductive health",
        ],
      },
    ],
  },
  "Grade 7": {
    phase: "Senior Phase",
    phaseColor: "#403294",
    phaseLight: "#eae6ff",
    phaseBorder: "#998dd9",
    description:
      "Grade 7 begins the Senior Phase. Learners now study distinct subjects with formal tasks and exams. Life Orientation replaces Life Skills, and Technology becomes a standalone subject.",
    subjects: [
      {
        name: "Home Language",
        icon: BookOpen,
        accent: "#0052cc",
        light: "#deebff",
        topics: [
          "Literature — novel study, poetry forms, drama text",
          "Reading & Comprehension — inference, critical reading, summaries",
          "Writing — transactional (letters, reports, speeches), creative essays",
          "Grammar — sentence analysis, direct/indirect speech, complex tenses",
          "Oral — formal speech, panel discussion, prepared & unprepared",
        ],
      },
      {
        name: "First Additional Language",
        icon: Globe,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "Literature — short story & simple novel, poems",
          "Reading — newspaper articles, visuals, adverts",
          "Writing — formal & transactional writing",
          "Grammar — full tense review, reported speech, punctuation",
        ],
      },
      {
        name: "Mathematics",
        icon: Calculator,
        accent: "#6554c0",
        light: "#eae6ff",
        topics: [
          "Whole Numbers — integers, directed numbers, exponents",
          "Rational Numbers — all operations with fractions & decimals",
          "Ratio, Rate & Proportion — direct & indirect proportion",
          "Algebra — algebraic expressions, factorisation, equations",
          "Functions — straight-line graphs, interpreting graphs",
          "Geometry — congruency, similarity, Theorem of Pythagoras",
          "Transformation Geometry — enlargement, reduction",
          "Data Handling — measures of central tendency & spread, probability",
        ],
      },
      {
        name: "Natural Sciences",
        icon: Leaf,
        accent: "#00875a",
        light: "#e3fcef",
        topics: [
          "Life & Living — diversity of life, biosphere, ecosystems",
          "Matter & Materials — atoms, molecules, elements, compounds",
          "Energy & Change — electrostatics, electric circuits, energy forms",
          "Earth & Beyond — solar system, space exploration, earth processes",
          "Scientific Investigation — hypothesis, variables, report writing",
        ],
      },
      {
        name: "Social Sciences",
        icon: Users,
        accent: "#ff8b00",
        light: "#fffae6",
        topics: [
          "History — imperialism & colonialism in Africa & Asia",
          "History — industrialisation and its impact on society",
          "History — 1948 apartheid election and early apartheid laws",
          "Geography — mapping skills, development indicators",
          "Geography — urbanisation in SA and the world",
        ],
      },
      {
        name: "Technology",
        icon: Code,
        accent: "#0065ff",
        light: "#e9f2ff",
        topics: [
          "Design Process — brief, investigate, design, make, evaluate",
          "Structures — bridges, towers, load-bearing design",
          "Processing — mechanical systems, robotics introduction",
          "Graphics — technical drawing, CAD basics",
          "ICT — responsible digital citizenship, spreadsheets, presentations",
        ],
      },
      {
        name: "Economic & Management Sciences",
        icon: DollarSign,
        accent: "#00a3bf",
        light: "#e6fcff",
        topics: [
          "The Economy — economic systems, sectors of the economy",
          "Business — formal vs informal sector, types of businesses",
          "Entrepreneurship — SWOT analysis, business plans",
          "Financial Literacy — income statements, cash flow, insurance",
        ],
      },
      {
        name: "Life Orientation",
        icon: Star,
        accent: "#de350b",
        light: "#ffebe6",
        topics: [
          "Development of the Self — identity, self-concept, diversity",
          "Social Development — human rights, constitutional rights, democracy",
          "Career & Career Choices — aptitudes, career paths, world of work",
          "Physical Development — fitness, nutrition, substance abuse",
          "Sports — physical activity participation & reflection",
        ],
      },
      {
        name: "Creative Arts",
        icon: Palette,
        accent: "#ae1c3e",
        light: "#ffecf0",
        topics: [
          "Visual Arts — still life, abstract art, SA heritage art",
          "Music — music theory, ensemble, SA music history",
          "Drama — written & oral dramatic performance",
          "Dance — physical theatre, SA indigenous dances",
        ],
      },
    ],
  },
};

const PHASE_CONFIG = {
  "Foundation Phase": {
    dot: "#00875a",
    label: "Foundation",
    tag: "#e3fcef",
    tagText: "#006644",
  },
  "Intermediate Phase": {
    dot: "#0052cc",
    label: "Intermediate",
    tag: "#deebff",
    tagText: "#0747a6",
  },
  "Senior Phase": {
    dot: "#6554c0",
    label: "Senior",
    tag: "#eae6ff",
    tagText: "#403294",
  },
};

// ── Hook ─────────────────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return width;
}

// ── Subject Row ──────────────────────────────────────────────────────────────
function SubjectRow({ subject }) {
  const [open, setOpen] = useState(false);
  const Icon = subject.icon;
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${open ? subject.accent + "66" : "#dfe1e6"}`,
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: open ? `0 0 0 2px ${subject.accent}18` : "none",
        marginBottom: 6,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 12px",
          background: open ? subject.light : "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: subject.light,
            border: `1px solid ${subject.accent}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={14} color={subject.accent} />
        </div>
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: "#172b4d",
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.3,
          }}
        >
          {subject.name}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            background: subject.light,
            color: subject.accent,
            border: `1px solid ${subject.accent}33`,
            borderRadius: 12,
            padding: "2px 8px",
            flexShrink: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {subject.topics.length}
        </span>
        <ChevronDown
          size={14}
          color="#6b778c"
          style={{
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            padding: "8px 12px 12px 54px",
            borderTop: `1px solid ${subject.accent}22`,
          }}
        >
          {subject.topics.map((topic, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "5px 0",
                borderBottom:
                  i < subject.topics.length - 1 ? "1px solid #f4f5f7" : "none",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: subject.accent,
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  color: "#344563",
                  lineHeight: 1.55,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {topic}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Grade List (Sidebar / Drawer content) ────────────────────────────────────
function GradeList({ selectedGrade, onSelectGrade, onClose, isMobile }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#f4f5f7",
      }}
    >
      {/* Drawer header (mobile only) */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #dfe1e6",
            background: "#fff",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#172b4d",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Select Grade
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <X size={18} color="#5e6c84" />
          </button>
        </div>
      )}

      {!isMobile && (
        <div
          style={{
            padding: "14px 14px 6px",
            fontSize: 10,
            fontWeight: 700,
            color: "#6b778c",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Curriculum
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        {Object.entries(CURRICULUM).map(([grade, gradeData]) => {
          const phaseInfo = PHASE_CONFIG[gradeData.phase];
          const active = grade === selectedGrade;
          return (
            <button
              key={grade}
              onClick={() => {
                onSelectGrade(grade);
                if (onClose) onClose();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: isMobile ? "13px 18px" : "8px 14px",
                background: active ? "#e9f2ff" : "transparent",
                border: "none",
                borderLeft: active
                  ? "3px solid #0052cc"
                  : "3px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: phaseInfo.dot,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: isMobile ? 14 : 12.5,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#0052cc" : "#344563",
                  flex: 1,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {grade}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  background: phaseInfo.tag,
                  color: phaseInfo.tagText,
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {gradeData.subjects.length}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid #dfe1e6" }}>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            color: "#97a0af",
            lineHeight: 1.5,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          SA CAPS Framework · Grades R – 7
        </p>
      </div>
    </div>
  );
}

// ── Top Nav ──────────────────────────────────────────────────────────────────
function TopNav({ onMenuClick, isMobile }) {
  return (
    <div
      style={{
        height: 48,
        background: "#0052cc",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
        flexShrink: 0,
      }}
    >
      {isMobile ? (
        <button
          onClick={onMenuClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 4,
            marginLeft: -4,
          }}
        >
          <Menu size={19} color="rgba(255,255,255,0.9)" />
        </button>
      ) : (
        <>
          <Grid size={15} color="rgba(255,255,255,0.8)" />
          <div
            style={{
              width: 1,
              height: 18,
              background: "rgba(255,255,255,0.2)",
            }}
          />
        </>
      )}

      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "-0.2px",
        }}
      >
        EduPortal
      </span>

      {!isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 4,
            padding: "0 10px",
            height: 30,
            marginLeft: 10,
            width: 260,
          }}
        >
          <Search size={12} color="rgba(255,255,255,0.65)" />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Search curriculum…
          </span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {!isMobile &&
        [HelpCircle, Bell, Settings].map((Ic, i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            <Ic size={15} color="rgba(255,255,255,0.75)" />
          </div>
        ))}
      {isMobile && (
        <Bell
          size={16}
          color="rgba(255,255,255,0.8)"
          style={{ cursor: "pointer" }}
        />
      )}

      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#ff8b00",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}
      >
        SA
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Curriculum() {
  const [selectedGrade, setSelectedGrade] = useState("Grade R");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 640;

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const data = CURRICULUM[selectedGrade];
  const phase = PHASE_CONFIG[data.phase];
  const totalTopics = data.subjects.reduce((a, s) => a + s.topics.length, 0);
  const pad = isMobile ? "16px 14px" : "20px 24px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "'DM Sans', sans-serif",
        background: "#f4f5f7",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c1c7d0; border-radius: 3px; }
      `}</style>

      <TopNav onMenuClick={() => setDrawerOpen(true)} isMobile={isMobile} />

      {/* Mobile overlay + drawer */}
      {isMobile && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              top: 48,
              background: "rgba(9,30,66,0.5)",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 48,
              left: 0,
              bottom: 0,
              width: 265,
              zIndex: 50,
              boxShadow: "4px 0 20px rgba(9,30,66,0.25)",
            }}
          >
            <GradeList
              selectedGrade={selectedGrade}
              onSelectGrade={setSelectedGrade}
              onClose={() => setDrawerOpen(false)}
              isMobile={true}
            />
          </div>
        </>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <div
            style={{
              width: 210,
              borderRight: "1px solid #dfe1e6",
              flexShrink: 0,
            }}
          >
            <GradeList
              selectedGrade={selectedGrade}
              onSelectGrade={setSelectedGrade}
              isMobile={false}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Breadcrumb bar */}
          <div
            style={{
              padding: isMobile ? "9px 14px" : "9px 24px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderBottom: "1px solid #dfe1e6",
              background: "#fff",
            }}
          >
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  marginRight: 2,
                  padding: 0,
                }}
              >
                <Menu size={15} color="#5e6c84" />
              </button>
            )}
            <span style={{ fontSize: 12, color: "#5e6c84" }}>Curriculum</span>
            <ChevronRight size={11} color="#97a0af" />
            <span style={{ fontSize: 12, color: "#172b4d", fontWeight: 600 }}>
              {selectedGrade}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: phase.tag,
                color: phase.tagText,
                borderRadius: 3,
                padding: "1px 7px",
                marginLeft: 4,
              }}
            >
              {phase.label}
            </span>
          </div>

          <div style={{ padding: pad, paddingBottom: 36 }}>
            {/* Heading */}
            <div style={{ marginBottom: 16 }}>
              <h1
                style={{
                  margin: "0 0 5px",
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 700,
                  color: "#172b4d",
                  letterSpacing: "-0.3px",
                }}
              >
                {selectedGrade}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: isMobile ? 12.5 : 13,
                  color: "#5e6c84",
                  lineHeight: 1.65,
                }}
              >
                {data.description}
              </p>
            </div>

            {/* Stats — horizontal scroll on mobile */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 18,
                ...(isMobile
                  ? {
                      overflowX: "auto",
                      paddingBottom: 4,
                      marginLeft: -14,
                      marginRight: -14,
                      paddingLeft: 14,
                      paddingRight: 14,
                    }
                  : {}),
              }}
            >
              {[
                {
                  label: "Subjects",
                  value: data.subjects.length,
                  icon: Layers,
                  color: "#0052cc",
                  bg: "#deebff",
                },
                {
                  label: "Total Topics",
                  value: totalTopics,
                  icon: Target,
                  color: "#00875a",
                  bg: "#e3fcef",
                },
                {
                  label: "Phase",
                  value: phase.label,
                  icon: GraduationCap,
                  color: data.phaseColor,
                  bg: phase.tag,
                },
              ].map((stat, i) => {
                const Ic = stat.icon;
                return (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #dfe1e6",
                      borderRadius: 6,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                      minWidth: isMobile ? 125 : 145,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: stat.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Ic size={15} color={stat.color} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#172b4d",
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "#6b778c",
                          marginTop: 2,
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subject chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 16,
              }}
            >
              {data.subjects.map((s) => {
                const Ic = s.icon;
                return (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: s.light,
                      border: `1px solid ${s.accent}33`,
                      borderRadius: 3,
                      padding: "3px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: s.accent,
                    }}
                  >
                    <Ic size={10} />
                    {s.name}
                  </div>
                );
              })}
            </div>

            {/* Section divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5e6c84",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                Subject Details
              </span>
              <div style={{ flex: 1, height: 1, background: "#dfe1e6" }} />
            </div>

            {/* Subject rows */}
            <div>
              {data.subjects.map((subject) => (
                <SubjectRow key={subject.name} subject={subject} />
              ))}
            </div>

            {/* Footer note */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 14px",
                background: "#fffae6",
                border: "1px solid #ffe380",
                borderRadius: 6,
                borderLeft: "4px solid #ff8b00",
              }}
            >
              <Info
                size={14}
                color="#ff8b00"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#5e6c84",
                  lineHeight: 1.65,
                }}
              >
                Content aligned to South Africa's{" "}
                <strong style={{ color: "#172b4d" }}>
                  Curriculum and Assessment Policy Statement (CAPS)
                </strong>{" "}
                as published by the Department of Basic Education (DBE). Topics
                represent core content and may be adapted per school context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
