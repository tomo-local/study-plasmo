import { createMachine, interpret } from 'xstate';

const popupMachine = createMachine({
  id: 'popup',
  initial: 'closed',
  states: {
    closed: {
      on: { OPEN: 'open' }
    },
    open: {
      on: { CLOSE: 'closed' }
    }
  }
});

const popupService = interpret(popupMachine).start();

export { popupMachine, popupService };