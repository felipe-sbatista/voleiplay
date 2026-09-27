import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tipos do Framework BDD Gherkin
export interface StepContext {
  [key: string]: any;
}

export type StepHandler = (context: StepContext, ...args: string[]) => Promise<void> | void;

export interface StepDefinition {
  regex: RegExp;
  handler: StepHandler;
}

export interface ParsedStep {
  keyword: string;
  text: string;
  line: number;
}

export interface ParsedScenario {
  name: string;
  steps: ParsedStep[];
}

export interface ParsedFeature {
  title: string;
  filePath: string;
  scenarios: ParsedScenario[];
}

// Registro global de Step Definitions
export const stepDefinitions: StepDefinition[] = [];

export function Given(regex: RegExp, handler: StepHandler) {
  stepDefinitions.push({ regex, handler });
}
export function When(regex: RegExp, handler: StepHandler) {
  stepDefinitions.push({ regex, handler });
}
export function Then(regex: RegExp, handler: StepHandler) {
  stepDefinitions.push({ regex, handler });
}
export function And(regex: RegExp, handler: StepHandler) {
  stepDefinitions.push({ regex, handler });
}

/**
 * Parser simples e robusto para arquivos Gherkin (.feature)
 */
export function parseGherkinFile(filePath: string): ParsedFeature {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let title = path.basename(filePath);
  const scenarios: ParsedScenario[] = [];
  let currentScenario: ParsedScenario | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('#')) continue;

    if (rawLine.startsWith('Funcionalidade:') || rawLine.startsWith('Feature:')) {
      title = rawLine.replace(/^(Funcionalidade|Feature):/, '').trim();
    } else if (rawLine.startsWith('Cenário:') || rawLine.startsWith('Scenario:')) {
      const scenarioName = rawLine.replace(/^(Cenário|Scenario):/, '').trim();
      currentScenario = { name: scenarioName, steps: [] };
      scenarios.push(currentScenario);
    } else if (currentScenario) {
      const match = rawLine.match(/^(Dado|Quando|Então|E|Mas|Given|When|Then|And|But)\s+(.*)$/);
      if (match) {
        currentScenario.steps.push({
          keyword: match[1],
          text: match[2].trim(),
          line: i + 1
        });
      }
    }
  }

  return { title, filePath, scenarios };
}

/**
 * Executor da Bateria de Testes Funcionais BDD
 */
export async function runGherkinSuite() {
  console.log('\n\x1b[1m\x1b[35m' + '═'.repeat(70) + '\x1b[0m');
  console.log('\x1b[1m\x1b[35m🏐 SUÍTE DE TESTES FUNCIONAIS BDD COM GHERKIN (Voleiplay Beach Pro Tour)\x1b[0m');
  console.log('\x1b[1m\x1b[35m' + '═'.repeat(70) + '\x1b[0m\n');

  const featuresDir = path.join(__dirname, 'features');
  const featureFiles = fs.readdirSync(featuresDir).filter(f => f.endsWith('.feature'));

  let totalFeatures = 0;
  let totalScenarios = 0;
  let totalSteps = 0;
  let passedSteps = 0;
  let failedSteps = 0;
  let failedScenarios = 0;

  const startTime = Date.now();

  for (const file of featureFiles) {
    totalFeatures++;
    const featurePath = path.join(featuresDir, file);
    const feature = parseGherkinFile(featurePath);

    console.log(`\x1b[1m\x1b[33m📖 Funcionalidade: ${feature.title}\x1b[0m \x1b[90m(${file})\x1b[0m`);

    for (const scenario of feature.scenarios) {
      totalScenarios++;
      console.log(`\n  \x1b[1m\x1b[36m▶ Cenário: ${scenario.name}\x1b[0m`);
      const context: StepContext = {};
      let scenarioFailed = false;

      for (const step of scenario.steps) {
        totalSteps++;
        // Procura step definition compatível
        let matchedDef: StepDefinition | null = null;
        let matchArgs: string[] = [];

        for (const def of stepDefinitions) {
          const m = step.text.match(def.regex);
          if (m) {
            matchedDef = def;
            matchArgs = m.slice(1);
            break;
          }
        }

        if (!matchedDef) {
          console.log(`    \x1b[31m✖ [${step.keyword}] ${step.text}\x1b[0m`);
          console.log(`      \x1b[31mErro: Nenhum Step Definition encontrado para: "${step.text}"\x1b[0m`);
          failedSteps++;
          scenarioFailed = true;
          break;
        }

        const stepStart = Date.now();
        try {
          await matchedDef.handler(context, ...matchArgs);
          const duration = Date.now() - stepStart;
          console.log(`    \x1b[32m✔\x1b[0m \x1b[90m${step.keyword.padEnd(5)}\x1b[0m ${step.text} \x1b[90m(${duration}ms)\x1b[0m`);
          passedSteps++;
        } catch (err: any) {
          const duration = Date.now() - stepStart;
          console.log(`    \x1b[31m✖\x1b[0m \x1b[90m${step.keyword.padEnd(5)}\x1b[0m ${step.text} \x1b[90m(${duration}ms)\x1b[0m`);
          console.log(`      \x1b[31mFalha: ${err.message}\x1b[0m`);
          failedSteps++;
          scenarioFailed = true;
          break;
        }
      }

      if (scenarioFailed) {
        failedScenarios++;
      }
    }
    console.log('');
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\x1b[1m\x1b[35m' + '─'.repeat(70) + '\x1b[0m');
  console.log('\x1b[1m📊 RESUMO DOS TESTES BDD / GHERKIN:\x1b[0m');
  console.log(`   Funcionalidades: \x1b[32m${totalFeatures} executadas\x1b[0m`);
  console.log(`   Cenários:        \x1b[32m${totalScenarios - failedScenarios} passaram\x1b[0m${failedScenarios > 0 ? ` | \x1b[31m${failedScenarios} falharam\x1b[0m` : ''}`);
  console.log(`   Passos (Steps):  \x1b[32m${passedSteps} passaram\x1b[0m${failedSteps > 0 ? ` | \x1b[31m${failedSteps} falharam\x1b[0m` : ''} (Total: ${totalSteps})`);
  console.log(`   Tempo Total:     \x1b[36m${totalDuration}s\x1b[0m`);
  console.log('\x1b[1m\x1b[35m' + '═'.repeat(70) + '\x1b[0m\n');

  if (failedScenarios > 0) {
    process.exit(1);
  }
}
