import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { AZURE_BEGIN_AUTH_WORKFLOW, azureArmTokenDataChanged } from '../action/azureAuthActions';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { SharedConstants } from '@bfemulator/app-shared';
import { RootState } from '../store';
import { DialogService } from '../../ui/dialogs/service';
import { AzureLoginSuccessDialogContainer } from '../../ui/dialogs';

const getArmTokenFromState = (state: RootState) => state.azureAuth.armToken;

export function* getArmToken(): IterableIterator<any> {
  let azureAuth = yield select(getArmTokenFromState);
  if (azureAuth.includes('invalid')) {
    const { RetrieveArmToken, PersistAzureLoginChanged } = SharedConstants.Commands.Azure;
    azureAuth = yield call(CommandServiceImpl.remoteCall.bind(CommandServiceImpl), RetrieveArmToken);
    if (azureAuth) {
      const persistLogin = yield DialogService.showDialog(AzureLoginSuccessDialogContainer);
      yield call(CommandServiceImpl.remoteCall.bind(CommandServiceImpl), PersistAzureLoginChanged, persistLogin);
    }
    yield put(azureArmTokenDataChanged(azureAuth));
  }
}

export function* azureAuthSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(AZURE_BEGIN_AUTH_WORKFLOW, getArmToken);
}
