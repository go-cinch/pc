import { request } from '@/utils/request';
import { FindActionReply } from '@/api/model/action';

const Api = {
  CreateAction: '/auth/action',
  FindAction: '/auth/action',
  UpdateAction: '/auth/action',
  DeleteAction: '/auth/action',
};

export function createAction(data) {
  return request.post({
    url: Api.CreateAction,
    data,
  });
}

export function findAction(params) {
  return request.get<FindActionReply>({
    url: Api.FindAction,
    params,
  });
}

export function updateAction(data) {
  return request.patch({
    url: `${Api.UpdateAction}/${data.id}`,
    data,
  });
}

export function deleteAction(ids) {
  return request.delete({
    url: `${Api.DeleteAction}/${ids.join(',')}`,
  });
}
