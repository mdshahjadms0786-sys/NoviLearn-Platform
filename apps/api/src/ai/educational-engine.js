/**
 * NoviLearn Intelligent Educational Engine
 * Provides accurate, curriculum-aligned, structured educational breakdowns,
 * visual flow diagrams, and adaptive assessment sets for school & college topics
 * across all 6 learning modes: Simple, Detailed, Example, Visual, Exam, Hinglish.
 */

function cleanTopic(query) {
  if (!query) return "General Concept";
  let t = query;
  // If query starts with "Topic: ..." extract the topic
  const topicMatch = t.match(/Topic:\s*([^\n\r]+)/i);
  if (topicMatch) {
    t = topicMatch[1];
  }
  return t
    .replace(/^Request:\s*Explain in\s+[a-z]+\s+mode\s*(for\s*)?/i, "")
    .replace(
      /^(what is|explain|tell me about|how does|what are|define|describe|kya hota hai|kya hai|samjhao)\s+/i,
      "",
    )
    .replace(/[?!.]+$/, "")
    .trim();
}

function detectMode(text) {
  const t = (text || "").toLowerCase();

  // 1. Explicit Mode: ... pattern
  const explicitMatch = t.match(/\[?mode\]?:\s*([a-z]+)/i);
  if (explicitMatch) {
    const m = explicitMatch[1].toLowerCase();
    if (
      ["simple", "detailed", "example", "visual", "exam", "hinglish"].includes(
        m,
      )
    ) {
      return m;
    }
  }

  // 2. Explicit request pattern: "Explain in X mode"
  const requestMatch = t.match(/explain (?:this )?in ([a-z]+) mode/i);
  if (requestMatch) {
    const m = requestMatch[1].toLowerCase();
    if (
      ["simple", "detailed", "example", "visual", "exam", "hinglish"].includes(
        m,
      )
    ) {
      return m;
    }
  }

  // 3. Keyword checks in user request
  if (t.includes("hinglish") || t.includes("hindi me") || t.includes("samjhao"))
    return "hinglish";
  if (t.includes("exam") || t.includes("board exam") || t.includes("marks"))
    return "exam";
  if (t.includes("visual") || t.includes("flowchart") || t.includes("diagram"))
    return "visual";
  if (t.includes("example") || t.includes("practical code")) return "example";
  if (
    t.includes("in-depth") ||
    t.includes("deep dive") ||
    t.includes("detailed breakdown")
  )
    return "detailed";

  return "simple";
}

const TOPIC_REGISTRY = {
  photosynthesis: {
    title: "Photosynthesis (प्रकाश संश्लेषण)",
    modes: {
      simple: {
        summary:
          "Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide.",
        explanation:
          "Plants use their green leaves like tiny solar panels. Chlorophyll inside the leaves absorbs sunlight, roots drink water from soil, and tiny leaf pores take in carbon dioxide from the air. Using solar energy, the plant cooks glucose (sugar for energy) and releases clean oxygen for us to breathe!\n\n**Simple Formula:**\nWater + Carbon Dioxide + Sunlight → Food (Glucose) + Fresh Oxygen",
      },
      detailed: {
        summary:
          "Detailed Biochemical Analysis of Oxygenic Photosynthesis & Carbon Assimilation.",
        explanation:
          "Photosynthesis is divided into two tightly coupled metabolic phases:\n\n**1. Light-Dependent Reactions (Thylakoid Membrane):**\n- **Photosystem II (P680)**: Sunlight photons excite reaction-center electrons, driving the photolysis of water ($2H_2O \\to 4H^+ + 4e^- + O_2$).\n- **Electron Transport Chain (Cytochrome b6f complex)**: Pumps protons into the thylakoid lumen, generating a proton gradient that powers **ATP Synthase**.\n- **Photosystem I (P700)**: Re-energizes electrons to reduce $NADP^+$ into $NADPH$ via Ferredoxin.\n\n**2. Light-Independent Reactions / Calvin Cycle (Stroma):**\n- **Carbon Fixation**: The primary enzyme **RuBisCO** fixes atmospheric $CO_2$ with Ribulose-1,5-bisphosphate into 3-PGA.\n- **Reduction**: 3-PGA is reduced to G3P using ATP and NADPH energy.\n- **Regeneration**: RuBP is regenerated to maintain continuous sugar output.",
      },
      example: {
        summary:
          "Real-World Examples & Practical Demonstrations of Photosynthesis in Nature.",
        explanation:
          "**Practical Real-Life Examples:**\n\n1. **Variegated Leaf Experiment**: White patches on money plant leaves lack chlorophyll; when tested with iodine solution, only the green patches turn blue-black, proving starch is only made where chlorophyll is present.\n2. **Aquatic Hydrilla Plant**: When submerged under an inverted funnel in a glass beaker in sunlight, continuous bubbles of oxygen gas collect at the top of the test tube.\n3. **Commercial Greenhouse Farming**: Modern Dutch greenhouses enrich indoor air with $CO_2$ up to 1200 ppm to accelerate photosynthetic sugar production, doubling tomato and bell pepper crop yields.",
      },
      visual: {
        summary:
          "Step-by-Step Visual Pathway of Solar Energy Conversion to Glucose.",
        explanation:
          "Follow the 4 sequential stages shown in the interactive flowchart below: from photon capture in the thylakoids to sugar storage in plant tissues.",
      },
      exam: {
        summary:
          "Exam-Ready High Yield Notes: Formulas, Key Definitions & Common Pitfalls for Photosynthesis.",
        explanation:
          "🎯 **Essential Exam Keywords & Formulas:**\n- **Balanced Chemical Equation**: $6CO_2 + 6H_2O \\xrightarrow{Sunlight + Chlorophyll} C_6H_{12}O_6 + 6O_2$\n- **Location of Light Reaction**: Thylakoid membrane (grana).\n- **Location of Dark Reaction**: Stroma of chloroplast.\n- **Key Enzyme**: RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase).\n\n⚠️ **Common Exam Pitfalls:**\n- **Myth**: 'Dark reaction happens at night.' — **Fact**: Dark reaction does not need darkness; it simply doesn't require direct photons (it uses ATP/NADPH made in light).\n- **Origin of Oxygen**: $O_2$ comes strictly from water splitting ($H_2O$), NOT from $CO_2$.",
      },
      hinglish: {
        summary:
          "Photosynthesis wo biological process hai jisse green plants sunlight, water aur CO2 ka use karke apna food banate hain aur oxygen release karte hain.",
        explanation:
          "Photosynthesis plant cells ke andar **chloroplasts** me hoti hai, jisme green pigment **chlorophyll** sunlight ko absorb karta hai.\n\nIski chemical reaction hai:\n**6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ (Glucose) + 6O₂**\n\nIske 2 main stages hote hain:\n1. **Light Reaction (Thylakoids me)**: Sunlight water ko split karti hai jisse ATP aur NADPH bante hain aur Oxygen release hoti hai.\n2. **Calvin Cycle (Stroma me)**: CO₂ fix hokar plant ka primary food yaani glucose banata hai.",
      },
    },
    keyPoints: [
      "Takes place in chloroplasts using chlorophyll pigment.",
      "Requires Sunlight, Carbon Dioxide (CO₂), and Water (H₂O).",
      "Produces Glucose (stored energy) and releases Oxygen (O₂).",
      "Consists of Light-dependent reactions and Light-independent Calvin cycle.",
    ],
    example:
      "A sunflower turning its face toward the sun to maximize light absorption for carbohydrate synthesis.",
    analogy:
      "Think of a plant like a solar-powered kitchen: sunlight is the stove electricity, water and CO2 are raw ingredients, and glucose is the baked bread.",
    followUps: [
      "What happens to photosynthesis rate during high temperatures?",
      "Why is RuBisCO called the most abundant enzyme on Earth?",
      "How do desert plants (CAM plants) perform photosynthesis without drying out?",
    ],
    relatedConcepts: [
      "Cellular Respiration",
      "Chloroplast & Chlorophyll",
      "Calvin Cycle",
      "Stomata Regulation",
    ],
    nextTopics: ["Cellular Respiration in Plants", "Plant Tissue Systems"],
    visualRepresentation: {
      type: "flow",
      title: "Photosynthesis Pathway",
      nodes: [
        {
          label: "1. Solar & Water Input",
          details: "Sunlight & H2O absorbed by leaf",
        },
        {
          label: "2. Light Reaction (Thylakoid)",
          details: "Water splits, O2 released, ATP/NADPH formed",
        },
        {
          label: "3. Calvin Cycle (Stroma)",
          details: "CO2 fixed with RuBisCO using ATP energy",
        },
        {
          label: "4. Output: Glucose & Energy",
          details: "C6H12O6 stored for plant growth",
        },
      ],
      edges: [
        { from: 0, to: 1, label: "Absorbs" },
        { from: 1, to: 2, label: "Powers" },
        { from: 2, to: 3, label: "Synthesizes" },
      ],
    },
  },

  newton: {
    title: "Newton's Laws of Motion",
    modes: {
      simple: {
        summary:
          "Newton's Three Laws explain how everything in our world moves, speeds up, and pushes back.",
        explanation:
          "1. **First Law (Lazy Law / Inertia)**: Things keep doing what they are already doing. If something is sitting still, it won't move until you push it. If it's rolling, it keeps rolling until friction stops it.\n2. **Second Law (F = ma)**: Heavier things need a bigger push to speed up. Pushing a toy car is easy; pushing a real car takes massive force!\n3. **Third Law (Action & Reaction)**: If you push a wall, the wall pushes back on you with the exact same strength.",
      },
      detailed: {
        summary:
          "Mathematical Formulation and Classical Vector Mechanics of Newton's Laws.",
        explanation:
          "Sir Isaac Newton formulated classical mechanics in his 1687 treatise *Philosophiae Naturalis Principia Mathematica*:\n\n1. **First Law (Inertial Reference Frames)**:\n   $\\sum \\vec{F} = 0 \\implies \\frac{d\\vec{v}}{dt} = 0$. In an inertial frame, velocity remains constant unless subjected to a non-zero net external force.\n2. **Second Law (Momentum Principle)**:\n   $\\vec{F}_{net} = \\frac{d\\vec{p}}{dt} = \\frac{d(m\\vec{v})}{dt}$. When mass is invariant, this simplifies to **$\\vec{F} = m \\cdot \\vec{a}$**.\n3. **Third Law (Action-Reaction Pair)**:\n   $\\vec{F}_{AB} = -\\vec{F}_{BA}$. Forces are mutual interactions between two bodies, identical in magnitude, collinear, and opposite in direction.",
      },
      example: {
        summary:
          "Real-World Examples & Everyday Applications of Newton's Laws.",
        explanation:
          "**Everyday Demonstrations:**\n1. **Seatbelts in Cars (1st Law)**: When a vehicle crashes to a sudden stop, passenger inertia keeps them traveling forward at 60 km/h; seatbelts provide the external stopping force to prevent injury.\n2. **Catching a Fast Cricket Ball (2nd Law)**: A fielder pulls their hands backward while catching a ball to increase collision time $\\Delta t$, thereby reducing the impact force ($F = \\Delta p / \\Delta t$).\n3. **Rocket Launch into Space (3rd Law)**: Rockets expel burning exhaust gases downward at hyper-velocity (Action); the escaping gas pushes the rocket upward into orbit (Reaction).",
      },
      visual: {
        summary: "Newtonian Vector Dynamics Flowchart.",
        explanation:
          "Visual breakdown showing how external unbalanced forces overcome inertia to generate acceleration and mutual reactions.",
      },
      exam: {
        summary:
          "Exam Preparation: Definitions, Derivations & Test Scoring Tips for Newton's Laws.",
        explanation:
          "🎯 **Key Exam Highlights:**\n- **SI Unit of Force**: Newton (N), where $1\\text{ N} = 1\\text{ kg}\\cdot\\text{m/s}^2$.\n- **Definition of Inertia**: Inherent resistance of an object to change its state of rest or uniform motion. Directly proportional to mass ($m$).\n- **Impulse**: $J = F \\cdot \\Delta t = \\Delta p$ (Change in momentum).\n\n⚠️ **Crucial Test Traps:**\n- Action and Reaction forces act on **DIFFERENT** bodies, so they **NEVER cancel each other out**!\n- If an object moves with constant velocity, net force is ZERO, not positive.",
      },
      hinglish: {
        summary:
          "Newton ke 3 Laws of Motion batate hain ki koi bhi object forces aur motion ke sath kaise behave karta hai, jo classical physics ka base hai.",
        explanation:
          "Sir Isaac Newton ne 3 fundamental laws diye the:\n\n1. **First Law (Inertia)**: Koi object rest me hai to rest me rahega, aur moving hai to move karta rahega jab tak koi external force na lage.\n2. **Second Law (F = ma)**: Force hamesha mass aur acceleration ka product hota hai (**Force = mass × acceleration**).\n3. **Third Law (Action-Reaction)**: Har action ka ek equal aur opposite reaction hota hai.",
      },
    },
    keyPoints: [
      "1st Law defines Inertia and the necessity of external force.",
      "2nd Law quantifies force: F = m × a (measured in Newtons).",
      "3rd Law states forces always occur in matched interaction pairs.",
      "Forms the foundation for engineering, aerospace, and everyday mechanics.",
    ],
    example:
      "When a bus suddenly applies brakes, passengers lurch forward due to their inertia of motion (1st Law).",
    analogy:
      "A skateboarder pushing backward against the pavement to propel themselves forward illustrates the 3rd Law (Action-Reaction).",
    followUps: [
      "Why is Newton's First Law also called Galileo's Law of Inertia?",
      "How is momentum conservation derived from the Second and Third Laws?",
      "What happens to acceleration if mass doubles while force remains constant?",
    ],
    relatedConcepts: [
      "Linear Momentum (p = mv)",
      "Frictional Forces",
      "Conservation of Energy",
      "Gravitational Force",
    ],
    nextTopics: ["Work, Energy and Power", "Circular Motion"],
    visualRepresentation: {
      type: "flow",
      title: "Newtonian Mechanics Flow",
      nodes: [
        {
          label: "1. State of Body",
          details: "Rest or uniform motion (Inertia)",
        },
        {
          label: "2. Net Force Applied",
          details: "Unbalanced force acts: F = m × a",
        },
        {
          label: "3. Acceleration Occurs",
          details: "Velocity changes in direction of force",
        },
        {
          label: "4. Reaction Force Exerted",
          details: "Equal and opposite force on agent",
        },
      ],
      edges: [
        { from: 0, to: 1, label: "Interrupted by" },
        { from: 1, to: 2, label: "Produces" },
        { from: 2, to: 3, label: "Accompanied by" },
      ],
    },
  },

  python: {
    title: "Python Programming & Functions",
    modes: {
      simple: {
        summary:
          "Python is a popular programming language written in clean, easy-to-read English.",
        explanation:
          "Instead of weird curly brackets and punctuation, Python uses simple spacing (indentation). You can create variables to store numbers, write `def` functions to perform actions, and run your code on any computer with zero headache!",
      },
      detailed: {
        summary:
          "Python Architecture: Bytecode Execution, Dynamic Typing & Memory Model.",
        explanation:
          "Python source code (`.py`) is compiled into intermediate bytecode (`.pyc`) executed by the **CPython Virtual Machine**:\n\n- **Dynamic Typing**: Variables are object references; types are bound at runtime rather than compile-time.\n- **Memory Management**: Employs private heap allocation with reference counting complemented by a cyclic garbage collector.\n- **Scope Hierarchy**: Evaluated according to the **LEGB rule** (Local, Enclosing, Global, Built-in).",
      },
      example: {
        summary: "Hands-on Code Examples in Python.",
        explanation:
          "```python\n# 1. Defining a reusable function\ndef calculate_discount(price, percent):\n    savings = price * (percent / 100)\n    return price - savings\n\n# 2. Using loops and list comprehension\nprices = [100, 250, 500, 1000]\nsale_prices = [calculate_discount(p, 10) for p in prices]\nprint(sale_prices)  # [90.0, 225.0, 450.0, 900.0]\n```",
      },
      visual: {
        summary: "Python Function Call Stack & Execution Lifecycle.",
        explanation:
          "Visual lifecycle showing how the Python interpreter creates function frames on the stack, executes statements, and returns values.",
      },
      exam: {
        summary: "Python Technical Interview & Exam High-Yield Topics.",
        explanation:
          "🎯 **Top Exam Questions:**\n- **Mutable vs Immutable**: Lists, Dicts, Sets are mutable; Tuples, Strings, Ints are immutable.\n- **List vs Tuple**: Tuples are read-only, hashable, and consume less memory than lists.\n- **`*args` vs `**kwargs`**: `*args` collects positional arguments into a tuple; `**kwargs` collects keyword arguments into a dictionary.",
      },
      hinglish: {
        summary:
          "Python ek easy-to-learn aur powerful programming language hai jiska syntax simple English jaisa hota hai, aur ye web development, data science aur AI me use hoti hai.",
        explanation:
          "Python me code bina complex brackets ke clean indentation (spacing) ke sath likha jata hai.\n\n**Key concepts:**\n- **Variables**: Data store karne ke liye (numbers, text, lists).\n- **Functions**: `def` keyword se code reuse karne ke liye functions banaye jaate hain.\n- **Loops**: `for` aur `while` loops bar-bar tasks repeat karne ke liye use hote hain.",
      },
    },
    keyPoints: [
      "Interpreted, dynamically typed, and human-readable syntax.",
      "Functions are first-class citizens declared with `def`.",
      "Rich standard library including math, sys, and data structures.",
      "Cross-platform support across Windows, macOS, and Linux.",
    ],
    example:
      "`sum([1, 2, 3, 4, 5])` quickly computes total elements using Python's built-in functional tooling.",
    analogy:
      "Writing Python is like writing instructions in plain, structured English rather than cryptographic code.",
    followUps: [
      "What is the difference between Python lists and tuples?",
      "How does Python manage memory with its Garbage Collector?",
      "What are *args and **kwargs in Python functions?",
    ],
    relatedConcepts: [
      "Object Oriented Programming",
      "Python Lists & Dicts",
      "List Comprehensions",
      "Modules and Packages",
    ],
    nextTopics: [
      "Object Oriented Programming in Python",
      "Data Structures with Python",
    ],
    visualRepresentation: {
      type: "flow",
      title: "Python Function Execution Flow",
      nodes: [
        { label: "1. Definition", details: "def function_name(parameters):" },
        {
          label: "2. Function Call",
          details: "Call function passing actual arguments",
        },
        {
          label: "3. Execution",
          details: "Execute internal statements with local scope",
        },
        { label: "4. Return Value", details: "return output to calling code" },
      ],
      edges: [
        { from: 0, to: 1, label: "Invoked by" },
        { from: 1, to: 2, label: "Executes" },
        { from: 2, to: 3, label: "Outputs" },
      ],
    },
  },

  mitochondria: {
    title: "Mitochondria - The Cellular Powerhouse",
    modes: {
      simple: {
        summary:
          "Mitochondria are tiny power plants inside your body's cells that turn food into energy.",
        explanation:
          "Every time you eat an apple or run in the playground, your cells need energy to keep working. Mitochondria take digested food and oxygen and manufacture tiny packets of chemical battery power called ATP!",
      },
      detailed: {
        summary:
          "Mitochondrial Ultrastructure, Krebs Cycle & Oxidative Phosphorylation.",
        explanation:
          "Mitochondria are double-membraned semi-autonomous organelles:\n\n- **Outer Membrane**: Porin-rich permeable lipid bilayer.\n- **Intermembrane Space**: High proton ($H^+$) accumulation zone generating electrochemical proton gradient.\n- **Inner Mitochondrial Membrane**: Invaginated into **cristae** to house the Electron Transport Chain (Complexes I-IV) and ATP Synthase ($F_0F_1$ complex).\n- **Matrix**: Fluid interior housing the Tricarboxylic Acid (Krebs) cycle enzymes, circular 16.5 kb mtDNA, and 70S ribosomes.",
      },
      example: {
        summary: "Real-World Biological Examples of Mitochondrial Demand.",
        explanation:
          "1. **Human Cardiac Muscle**: Heart cells never take a break; as a result, up to 40% of their total cell volume consists of dense mitochondria.\n2. **Cyanide Toxicity**: Cyanide poisons Cytochrome c Oxidase in the electron transport chain, halting ATP synthesis and causing cellular asphyxiation in minutes.",
      },
      visual: {
        summary: "4-Stage Cellular Energy Synthesis Flowchart.",
        explanation:
          "Step-by-step pathway from glycolysis in the cytoplasm to oxidative ATP production in the inner mitochondrial matrix.",
      },
      exam: {
        summary:
          "Mitochondria: Exam Keywords, Diagram Labeling & Test Questions.",
        explanation:
          "🎯 **High-Yield Exam Points:**\n- **Primary Function**: Aerobic respiration and ATP synthesis.\n- **Endosymbiotic Theory**: Mitochondria evolved from engulfed aerobic alpha-proteobacteria (evidence: own circular DNA & 70S ribosomes).\n- **Maternal Inheritance**: Mitochondrial DNA is inherited almost exclusively from the mother via the ovum cytoplasm.",
      },
      hinglish: {
        summary:
          "Mitochondria cell ka **Powerhouse** hota hai jo food nutrients ko ATP (cellular energy) me convert karta hai jisse hamara body functions perform kar sake.",
        explanation:
          "Mitochondria cellular respiration ke through energy banata hai.\n\n**Iske main parts:**\n- **Outer Membrane**: Protective layer jo nutrients ko andar aane deti hai.\n- **Inner Membrane**: Folded shape (cristae) jisme ATP Synthase hota hai.\n- **Matrix**: Jahan Krebs cycle chalti hai aur ATP generate hoti hai.",
      },
    },
    keyPoints: [
      "Known universally as the 'Powerhouse of the Cell'.",
      "Produces ATP via oxidative phosphorylation and the Krebs cycle.",
      "Contains its own autonomous circular DNA (mtDNA) and ribosomes.",
      "Originates from ancient endosymbiotic bacterial engulfment.",
    ],
    example:
      "Human heart and muscle cells contain thousands of mitochondria because they require continuous mechanical energy.",
    analogy:
      "A hydroelectric dam: the proton gradient across the inner membrane turns ATP Synthase like a water turbine to generate electricity (ATP).",
    followUps: [
      "Why do mitochondria have their own circular DNA separate from the cell nucleus?",
      "How many net ATP molecules are produced from one glucose molecule?",
      "What is the role of cristae folds in cellular respiration?",
    ],
    relatedConcepts: [
      "Adenosine Triphosphate (ATP)",
      "Krebs Cycle / Citric Acid Cycle",
      "Endosymbiotic Theory",
      "Cellular Respiration",
    ],
    nextTopics: ["Cellular Respiration", "Structure of Animal & Plant Cells"],
    visualRepresentation: {
      type: "flow",
      title: "Mitochondrial Energy Generation",
      nodes: [
        {
          label: "1. Glycolysis in Cytoplasm",
          details: "Glucose split into Pyruvate",
        },
        {
          label: "2. Krebs Cycle in Matrix",
          details: "Acetyl-CoA oxidized, NADH/FADH2 generated",
        },
        {
          label: "3. Electron Transport Chain",
          details: "Protons pumped across inner membrane",
        },
        {
          label: "4. ATP Synthase Turbine",
          details: "Proton flow synthesizes ATP molecules",
        },
      ],
      edges: [
        { from: 0, to: 1, label: "Enters Matrix" },
        { from: 1, to: 2, label: "Feeds Electrons" },
        { from: 2, to: 3, label: "Drives" },
      ],
    },
  },

  ohm: {
    title: "Ohm's Law & Electrical Circuits",
    modes: {
      simple: {
        summary:
          "Ohm's Law is the basic rule of electricity: Voltage equals Current times Resistance (V = I × R).",
        explanation:
          "Think of electricity like water flowing through a hose:\n- **Voltage (V)** is the water pressure pushing through.\n- **Current (I)** is how fast the water is flowing.\n- **Resistance (R)** is when you pinch the hose to slow it down!\n\nIf you push harder (more Voltage), more water flows (more Current)!",
      },
      detailed: {
        summary:
          "Constitutive Relation & Microscopic Ohm's Law in Electrodynamics.",
        explanation:
          "Macroscopic formulation: **$V = I \\cdot R$**\n\nMicroscopic / Vector formulation:\n$$\\vec{J} = \\sigma \\vec{E} = \\frac{1}{\\rho} \\vec{E}$$\nWhere:\n- $\\vec{J}$ is current density vector ($A/m^2$)\n- $\\sigma$ is electrical conductivity\n- $\\vec{E}$ is applied electric field vector ($V/m$)\n- $\\rho$ is material resistivity ($\\Omega\\cdot m$)\n\nUnder constant temperature and physical dimensions, the ratio of potential difference to electric current remains strictly linear.",
      },
      example: {
        summary: "Worked Numerical Circuit Examples for Ohm's Law.",
        explanation:
          "**Sample Problem:**\nA circuit has a 12V automotive battery powering a headlamp with 4 Ohms resistance. Calculate current drawn and total power.\n\n**Solution:**\n1. Current: $I = \\frac{V}{R} = \\frac{12\\text{ V}}{4\\text{ }\\Omega} = 3\\text{ Amperes}$.\n2. Power: $P = V \\times I = 12\\text{ V} \\times 3\\text{ A} = 36\\text{ Watts}$.",
      },
      visual: {
        summary: "Circuit Potential Drop & Current Vector Diagram.",
        explanation:
          "Visual progression tracking electrical charge from positive terminal through resistive load to ground.",
      },
      exam: {
        summary:
          "Ohm's Law: Exam High Yields, Limitations & Common Test Questions.",
        explanation:
          "🎯 **Exam Points to Memorize:**\n- **Formula variations**: $V = IR$, $I = V / R$, $R = V / I$.\n- **Ohmic vs Non-Ohmic Conductors**: Metals at constant temp have linear V-I graphs (Ohmic); diodes and incandescent bulbs have curved V-I graphs (Non-Ohmic).\n- **Resistance Factors**: $R = \\rho \\frac{L}{A}$ (Length doubles = resistance doubles; Area doubles = resistance halves).",
      },
      hinglish: {
        summary:
          "Ohm's Law electrical circuits ka basic formula hai jo batata hai ki Voltage hamesha Current aur Resistance ke product ke barabar hota hai (**V = I × R**).",
        explanation:
          "Ohm's Law ka formula hai:\n**V = I × R**\n\n- **V (Voltage)**: Push ya electrical pressure (Volts me).\n- **I (Current)**: Electrons ka flow rate (Amperes me).\n- **R (Resistance)**: Flow me rukawat (Ohms me).\n\nAgar resistance fix ho aur voltage badhayein, to current bhi proportional badhega.",
      },
    },
    keyPoints: [
      "Fundamental equation: V = I × R, or I = V / R.",
      "Applicable to ohmic conductors under steady temperature conditions.",
      "Current is inversely proportional to resistance.",
      "Core design rule for resistors, circuit boards, and electrical appliances.",
    ],
    example:
      "A 9V battery connected to a 3Ω lightbulb draws exactly 3 Amperes of current (I = 9 / 3 = 3A).",
    analogy:
      "Water pipe analogy: Voltage is water pressure from a pump, Current is water flow rate, and Resistance is a narrow constriction in the pipe.",
    followUps: [
      "Why does temperature change cause non-ohmic resistance behavior in incandescent bulbs?",
      "How do series and parallel resistor combinations affect total equivalent resistance?",
      "What is the difference between resistance and resistivity?",
    ],
    relatedConcepts: [
      "Electric Potential & EMF",
      "Kirchhoff's Circuit Laws",
      "Resistors in Series and Parallel",
      "Electrical Power (P = VI)",
    ],
    nextTopics: ["Kirchhoff's Laws", "Electromagnetic Induction"],
    visualRepresentation: {
      type: "flow",
      title: "Ohm's Law Relationship",
      nodes: [
        {
          label: "1. Voltage Source (V)",
          details: "Potential difference creates electric field",
        },
        {
          label: "2. Resistance Barrier (R)",
          details: "Material opposition to electron passage",
        },
        {
          label: "3. Current Flow (I = V/R)",
          details: "Charge carriers flow at rate dictated by V and R",
        },
        {
          label: "4. Power Dissipated (P = I²R)",
          details: "Thermal or luminous energy emitted",
        },
      ],
      edges: [
        { from: 0, to: 1, label: "Applied across" },
        { from: 1, to: 2, label: "Results in" },
        { from: 2, to: 3, label: "Dissipates" },
      ],
    },
  },

  gravity: {
    title: "Gravitational Force & Universal Gravitation",
    modes: {
      simple: {
        summary:
          "Gravity is the invisible natural pull that pulls objects toward each other and keeps our feet on the ground.",
        explanation:
          "Anything that has weight or mass has gravity. Because Earth is huge, its gravity pulls you, your house, and the ocean water down toward its center. It is also what keeps the Moon circling around the Earth!",
      },
      detailed: {
        summary:
          "Universal Gravitational Law & General Relativistic Geodesics.",
        explanation:
          "Newtonian formulation:\n$$F = G \\frac{m_1 m_2}{r^2}$$\nWhere $G = 6.67430 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$.\n\nIn Einstein's General Relativity, gravity is not an action-at-a-distance force, but rather the manifestation of spacetime curvature described by the Einstein Field Equations:\n$$R_{\\mu\\nu} - \\frac{1}{2}Rg_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}$$",
      },
      example: {
        summary: "Real-World Astronomical & Everyday Gravity Examples.",
        explanation:
          "1. **Ocean Tides**: The Moon's gravitational gradient pulls ocean waters toward it, creating two high tides and two low tides on Earth each day.\n2. **GPS Satellite Clock Drift**: Because gravity is weaker in orbital altitudes than on Earth's surface, satellite atomic clocks tick slightly faster, requiring relativistic time corrections of ~38 microseconds per day.",
      },
      visual: {
        summary: "Gravitational Inverse-Square Force Flowchart.",
        explanation:
          "Step-by-step sequence detailing mass interaction, gravitational fields, and stable orbital equilibrium.",
      },
      exam: {
        summary: "Gravity: High-Yield Formulas, Derivations & Board Exam Tips.",
        explanation:
          "🎯 **Essential Exam Points:**\n- **Acceleration due to gravity**: $g = \\frac{GM}{R^2} \\approx 9.8\\text{ m/s}^2$ on Earth's surface.\n- **Variation of g**: $g$ decreases as you go higher above Earth ($h$) or deeper into a mine ($d$). Max at poles, min at equator.\n- **Escape Velocity**: $v_e = \\sqrt{2gR} \\approx 11.2\\text{ km/s}$ on Earth.",
      },
      hinglish: {
        summary:
          "Gravitational force wo attraction force hai jo universe ke har do masses ke beech lagta hai. Iske bina Earth par life aur planets ka orbit possible nahi hai.",
        explanation:
          "Universe me koi bhi do cheezein jinke paas mass hai, ek doosre ko apni taraf kheenchti hain:\n\n**F = G × (m₁ × m₂) / r²**\n\n- **G**: Universal Gravitational Constant\n- **m1, m2**: Dono objects ka mass\n- **r**: Dono ke beech ki distance\n\nEarth ki surface par gravitational acceleration **g ≈ 9.8 m/s²** hota hai, jis wajah se cheezein niche girti hain.",
      },
    },
    keyPoints: [
      "Always an attractive force, never repulsive.",
      "Governed by the inverse-square law: doubling distance quarters the force.",
      "Earth's acceleration due to gravity is g ≈ 9.8 m/s².",
      "Keeps the Moon in orbit around Earth and planets orbiting the Sun.",
    ],
    example:
      "An apple detaching from a branch accelerating downward toward Earth at 9.8 m/s².",
    analogy:
      "Imagine placing a heavy bowling ball on a rubber trampoline: it curves the fabric so smaller marbles naturally roll toward it.",
    followUps: [
      "Why is weight different on the Moon while mass remains unchanged?",
      "How does Einstein's spacetime curvature explain gravity differently from Newton?",
      "What is escape velocity and how is it calculated for Earth?",
    ],
    relatedConcepts: [
      "Acceleration due to Gravity (g)",
      "Mass vs Weight",
      "Kepler's Laws of Planetary Motion",
      "Escape Velocity",
    ],
    nextTopics: ["Kepler's Laws", "Circular & Orbital Motion"],
    visualRepresentation: {
      type: "flow",
      title: "Gravitational Attraction Mechanism",
      nodes: [
        {
          label: "1. Mass Distribution",
          details: "Two bodies with masses m1 and m2",
        },
        {
          label: "2. Spacetime Interaction",
          details: "Distance r establishes inverse-square field",
        },
        {
          label: "3. Mutual Attractive Force",
          details: "F = G(m1·m2)/r² exerted equally on both",
        },
        {
          label: "4. Resultant Orbital Motion",
          details: "Continuous free-fall creates stable orbits",
        },
      ],
      edges: [
        { from: 0, to: 1, label: "Separated by" },
        { from: 1, to: 2, label: "Generates" },
        { from: 2, to: 3, label: "Maintains" },
      ],
    },
  },
};

export function generateEducationalResponse(question, preferences = "") {
  const qLower = question.toLowerCase();
  const topicName = cleanTopic(question);
  const mode = detectMode(question);

  // Check matching registry topic
  let matched = null;
  if (qLower.includes("gravit") || qLower.includes("gurutva"))
    matched = TOPIC_REGISTRY.gravity;
  else if (qLower.includes("photo") || qLower.includes("prakash"))
    matched = TOPIC_REGISTRY.photosynthesis;
  else if (
    qLower.includes("newton") ||
    qLower.includes("motion") ||
    qLower.includes("inertia")
  )
    matched = TOPIC_REGISTRY.newton;
  else if (
    qLower.includes("python") ||
    qLower.includes("function") ||
    qLower.includes("loop") ||
    qLower.includes("code")
  )
    matched = TOPIC_REGISTRY.python;
  else if (
    qLower.includes("mito") ||
    qLower.includes("powerhouse") ||
    qLower.includes("atp")
  )
    matched = TOPIC_REGISTRY.mitochondria;
  else if (
    qLower.includes("ohm") ||
    qLower.includes("circuit") ||
    qLower.includes("voltage") ||
    qLower.includes("resistance")
  )
    matched = TOPIC_REGISTRY.ohm;

  if (matched) {
    const modeContent = matched.modes[mode] || matched.modes.simple;
    return {
      summary: modeContent.summary,
      explanation: modeContent.explanation,
      modes: matched.modes,
      keyPoints: matched.keyPoints,
      example: matched.example,
      analogy: matched.analogy,
      followUps: matched.followUps,
      relatedConcepts: matched.relatedConcepts,
      nextTopics: matched.nextTopics,
      visualRepresentation: matched.visualRepresentation,
    };
  }

  // Universal dynamic response for any user query across modes
  const displayTopic = topicName.charAt(0).toUpperCase() + topicName.slice(1);
  let summary = `${displayTopic} is a key concept centered on fundamental principles, systemic interactions, and practical applications.`;
  let explanation = `**${displayTopic}** is structured into essential fundamental phases:\n\n1. **Definition & Foundation**: Understanding the core terminology and baseline conditions governing this area.\n2. **Mechanism & Execution**: How the primary elements interact step-by-step to produce observable results.\n3. **Real-world Significance**: Why this concept is pivotal in modern practice, exams, and subsequent higher-level applications.`;

  if (mode === "detailed") {
    summary = `Detailed Technical Breakdown & Mechanisms of ${displayTopic}.`;
    explanation = `Comprehensive academic exploration of **${displayTopic}**:\n\n1. **Theoretical Foundations**: The historical and mathematical framework underpinning this domain.\n2. **Core Processes & Interactions**: Exact mechanisms, inputs, energy transfers, and algorithmic/physical laws.\n3. **Edge Cases & Limitations**: Boundary conditions, common constraints, and modern research frontiers.`;
  } else if (mode === "example") {
    summary = `Practical Real-World Examples & Case Studies of ${displayTopic}.`;
    explanation = `**Hands-on Case Studies for ${displayTopic}:**\n\n1. **Everyday Life Application**: How individuals encounter ${displayTopic} in daily operations.\n2. **Industrial & Technological Usage**: How modern engineers, scientists, and systems utilize ${displayTopic} at scale.\n3. **Practical Problem Walkthrough**: Step-by-step resolution of a typical scenario involving ${displayTopic}.`;
  } else if (mode === "visual") {
    summary = `Visual Architecture & Step-by-Step Flow of ${displayTopic}.`;
    explanation = `The interactive diagram below visualizes the primary transformation flow of **${displayTopic}**, detailing inputs, intermediary states, and conclusive outputs.`;
  } else if (mode === "exam") {
    summary = `Exam Preparation: High-Yield Definitions & Common Pitfalls for ${displayTopic}.`;
    explanation = `🎯 **Exam Mastery Guide for ${displayTopic}:**\n\n- **Essential Definitions**: Exact terminology expected by examiners to award full marks.\n- **Crucial Equations / Rules**: Primary formulas and conditions required for solving test problems.\n- **Common Mistakes to Avoid**: Frequent pitfalls where students lose marks on written assessments.`;
  } else if (mode === "hinglish") {
    summary = `${displayTopic} ke baare me simple Hinglish explanation: Ye ek important concept hai jisme step-by-step principles aur practical use shamil hain.`;
    explanation = `**${displayTopic}** ko aasaani se samajhte hain:\n\n1. **Core Concept**: Ye topic primary mechanisms aur underlying rules ko define karta hai.\n2. **Kaise Kaam Karta Hai**: Inputs ko systematically convert kiya jata hai expected results me.\n3. **Kyo Zaroori Hai**: Iska practical use exams, real-life systems aur higher concepts ke liye zaroori hai.`;
  }

  const universalModes = {
    simple: {
      summary: `${displayTopic} is a key concept centered on fundamental principles, systemic interactions, and practical applications.`,
      explanation: `**${displayTopic}** is structured into essential fundamental phases:\n\n1. **Definition & Foundation**: Understanding the core terminology and baseline conditions governing this area.\n2. **Mechanism & Execution**: How the primary elements interact step-by-step to produce observable results.\n3. **Real-world Significance**: Why this concept is pivotal in modern practice, exams, and subsequent higher-level applications.`,
    },
    detailed: {
      summary: `Detailed Technical Breakdown & Mechanisms of ${displayTopic}.`,
      explanation: `Comprehensive academic exploration of **${displayTopic}**:\n\n1. **Theoretical Foundations**: The historical and mathematical framework underpinning this domain.\n2. **Core Processes & Interactions**: Exact mechanisms, inputs, energy transfers, and algorithmic/physical laws.\n3. **Edge Cases & Limitations**: Boundary conditions, common constraints, and modern research frontiers.`,
    },
    example: {
      summary: `Practical Real-World Examples & Case Studies of ${displayTopic}.`,
      explanation: `**Hands-on Case Studies for ${displayTopic}:**\n\n1. **Everyday Life Application**: How individuals encounter ${displayTopic} in daily operations.\n2. **Industrial & Technological Usage**: How modern engineers, scientists, and systems utilize ${displayTopic} at scale.\n3. **Practical Problem Walkthrough**: Step-by-step resolution of a typical scenario involving ${displayTopic}.`,
    },
    visual: {
      summary: `Visual Architecture & Step-by-Step Flow of ${displayTopic}.`,
      explanation: `The interactive diagram below visualizes the primary transformation flow of **${displayTopic}**, detailing inputs, intermediary states, and conclusive outputs.`,
    },
    exam: {
      summary: `Exam Preparation: High-Yield Definitions & Common Pitfalls for ${displayTopic}.`,
      explanation: `🎯 **Exam Mastery Guide for ${displayTopic}:**\n\n- **Essential Definitions**: Exact terminology expected by examiners to award full marks.\n- **Crucial Equations / Rules**: Primary formulas and conditions required for solving test problems.\n- **Common Mistakes to Avoid**: Frequent pitfalls where students lose marks on written assessments.`,
    },
    hinglish: {
      summary: `${displayTopic} ke baare me simple Hinglish explanation: Ye ek important concept hai jisme step-by-step principles aur practical use shamil hain.`,
      explanation: `**${displayTopic}** ko aasaani se samajhte hain:\n\n1. **Core Concept**: Ye topic primary mechanisms aur underlying rules ko define karta hai.\n2. **Kaise Kaam Karta Hai**: Inputs ko systematically convert kiya jata hai expected results me.\n3. **Kyo Zaroori Hai**: Iska practical use exams, real-life systems aur higher concepts ke liye zaroori hai.`,
    },
  };

  const selectedMode = universalModes[mode] || universalModes.simple;
  summary = selectedMode.summary;
  explanation = selectedMode.explanation;

  return {
    summary,
    explanation,
    modes: universalModes,
    keyPoints: [
      `Primary definition and operational scope of ${displayTopic}.`,
      "Key theoretical principles and essential equations/rules.",
      "Standard edge cases, common pitfalls, and best practices.",
      "Practical applications across modern disciplines.",
    ],
    example: `A standard practical demonstration of ${displayTopic} in action within structured real-world scenarios.`,
    analogy: `Think of ${displayTopic} like a well-coordinated system where each rule ensures consistent, predictable results.`,
    followUps: [
      `What are the most common misconceptions about ${displayTopic}?`,
      `How does ${displayTopic} connect to advanced subsequent topics?`,
      `Can you give a numerical or practical problem testing ${displayTopic}?`,
    ],
    relatedConcepts: [
      `${displayTopic} Fundamentals`,
      "Practical Implementations",
      "Advanced Applications",
      "Diagnostic Problem Solving",
    ],
    nextTopics: [`Advanced ${displayTopic}`, "Self-Assessment Practice Set"],
    visualRepresentation: {
      type: "flow",
      title: `${displayTopic} Process Sequence`,
      nodes: [
        {
          label: "1. Initial Condition",
          details: `Input state for ${displayTopic}`,
        },
        {
          label: "2. Core Mechanism",
          details: "Active rule execution & transformation",
        },
        {
          label: "3. Systematic Result",
          details: "Final steady state and verifiable outcome",
        },
      ],
      edges: [
        { from: 0, to: 1, label: "Initiates" },
        { from: 1, to: 2, label: "Produces" },
      ],
    },
  };
}
