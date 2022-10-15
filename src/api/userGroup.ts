import { request } from '@/utils/request';
import { FindUserGroupReply } from '@/api/model/userGroup';

const Api = {
  CreateUserGroup: '/auth/user/group',
  FindUserGroup: '/auth/user/group',
  UpdateUserGroup: '/auth/user/group',
  DeleteUserGroup: '/auth/user/group',
};

export function createUserGroup(data) {
  return request.post({
    url: Api.CreateUserGroup,
    data,
  });
}

export function findUserGroup(params) {
  return request.get<FindUserGroupReply>({
    url: Api.FindUserGroup,
    params,
  });
}

export function updateUserGroup(data) {
  return request.patch({
    url: `${Api.UpdateUserGroup}/${data.id}`,
    data,
  });
}

export function deleteUserGroup(ids) {
  return request.delete({
    url: `${Api.DeleteUserGroup}/${ids.join(',')}`,
  });
}
