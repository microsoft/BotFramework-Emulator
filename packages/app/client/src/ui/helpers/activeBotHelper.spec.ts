// jest.mock('../../platform/commands/commandServiceImpl', () => ({
//   CommandServiceImpl: {
//     /**
//      * @param commandName name of command to invoke
//      * @param returnValue value that you want the mock command to return
//      * @param throwErr if true, will throw an error
//      */
//     call: (commandName: string, returnValue: any, throwErr?: boolean) => {
//       if (throwErr) {
//         throw new Error();
//       }
//       return returnValue;
//     },

//     /**
//      * @param commandName name of command to invoke
//      * @param returnValue value that you want the mock command to return
//      * @param throwErr if true, will throw an error
//      */
//     remoteCall: (commandName: string, returnValue: any, throwErr?: boolean) => {
//       if (throwErr) {
//         throw new Error();
//       }
//       return returnValue;
//     }
//   }
// }));

// import { ActiveBotHelper } from './activeBotHelper';

// describe('ActiveBotHelper tests', () => {
//   it('should confirm switching bots', () => {
//     ActiveBotHelper.switch
//   });

//   // unmock command service
//   jest.unmock('../../platform/commands/commandServiceImpl');
// });

it('should do something', () => {
  expect(true).toBe(true);
});
