import { Page } from '@/api/page';

export interface Role {
  id: string;
  name: string;
  word: string;
}

export interface FindRoleReply {
  page: Page;
  list: Array<Role>;
}
