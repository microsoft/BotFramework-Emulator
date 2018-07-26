import { call, put, select, takeEvery } from 'redux-saga/effects';
import { AZURE_BEGIN_AUTH_WORKFLOW, azureArmTokenDataChanged } from '../action/azureAuthActions';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { SharedConstants } from '@bfemulator/app-shared';
import { DialogService } from '../../ui/dialogs/service';
const getArmTokenFromState = (state) => state.azureAuth.armToken;
export function* getArmToken(action) {
    let azureAuth = yield select(getArmTokenFromState);
    if (!azureAuth.includes('invalid')) {
        return;
    }
    const confirmLoginWithAzure = DialogService.showDialog(action.payload.promptDialog);
    if (!confirmLoginWithAzure) {
        return;
    }
    const { RetrieveArmToken, PersistAzureLoginChanged } = SharedConstants.Commands.Azure;
    azureAuth = yield call(CommandServiceImpl.remoteCall.bind(CommandServiceImpl), RetrieveArmToken);
    if (azureAuth) {
        const persistLogin = yield DialogService.showDialog(action.payload.loginSuccessDialog);
        yield call(CommandServiceImpl.remoteCall.bind(CommandServiceImpl), PersistAzureLoginChanged, persistLogin);
    }
    yield put(azureArmTokenDataChanged(azureAuth));
}
export function* azureAuthSagas() {
    yield takeEvery(AZURE_BEGIN_AUTH_WORKFLOW, getArmToken);
}
//# sourceMappingURL=azureAuthSaga.js.map