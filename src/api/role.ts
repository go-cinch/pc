import { request } from '@/utils/request';
import { FindRoleReply } from '@/api/model/role';

const Api = {
  CreateRole: '/auth/role',
  FindRole: '/auth/role',
  UpdateRole: '/auth/role',
  DeleteRole: '/auth/role',
};

export function createRole(data) {
  return request.post({
    url: Api.CreateRole,
    data,
  });
}

export function findRole(params) {
  return request.get<FindRoleReply>({
    url: Api.FindRole,
    params,
  });
}

export function updateRole(data) {
  return request.patch({
    url: `${Api.UpdateRole}/${data.id}`,
    data,
  });
}

export function deleteRole(ids) {
  return request.delete({
    url: `${Api.DeleteRole}/${ids.join(',')}`,
  });
}
