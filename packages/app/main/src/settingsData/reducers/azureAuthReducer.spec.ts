import { combineReducers, createStore, Store } from "redux";
import { azureAuth } from "./azureAuthReducer";
import { Settings } from "@bfemulator/app-shared";
import {
  azureLoggedInUserChanged,
  azurePersistLoginChanged
} from "../actions/azureAuthActions";
describe("The azureAuth reducer", () => {
  let store: Store<Settings>;

  beforeAll(() => {
    store = createStore(combineReducers({ azure: azureAuth }));
  });

  it("should create the store with the expected defaults", () => {
    expect(JSON.stringify(store.getState().azure)).toBe(JSON.stringify({}));
  });

  it('should set the "persistLogin" value', () => {
    store.dispatch(azurePersistLoginChanged(true));
    expect(store.getState().azure.persistLogin).toBe(true);
  });

  it('should set the "signedInUser" value', () => {
    store.dispatch(azureLoggedInUserChanged("hidi-ho!@southpark.com"));
    expect(store.getState().azure.signedInUser).toBe("hidi-ho!@southpark.com");
  });
});
