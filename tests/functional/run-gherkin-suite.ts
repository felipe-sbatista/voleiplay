import './step-definitions.js';
import { runGherkinSuite } from './gherkin-runner.js';

runGherkinSuite().catch(err => {
  console.error('\x1b[31m[Gherkin Runner] Erro fatal na execução dos testes:\x1b[0m', err);
  process.exit(1);
});
