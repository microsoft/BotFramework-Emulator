import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { AZURE_BEGIN_AUTH_WORKFLOW, azureArmTokenDataChanged } from '../action/azureAuthActions';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { SharedConstants } from '@bfemulator/app-shared';
import { RootState } from '../store';

const getArmTokenFromState = (state: RootState) => state.azureAuth.armToken;

export function* getArmToken(): IterableIterator<any> {
  let azureAuth = yield select(getArmTokenFromState);
  if (!azureAuth) {
    azureAuth = yield call(CommandServiceImpl.remoteCall
      .bind(CommandServiceImpl), SharedConstants.Commands.Azure.RetrieveArmToken);
    yield put(azureArmTokenDataChanged(azureAuth));
  }
}

export function* azureAuthSagas(): IterableIterator<ForkEffect> {
  takeEvery(AZURE_BEGIN_AUTH_WORKFLOW, getArmToken);
}
