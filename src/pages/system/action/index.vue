<template>
  <div class="list-common-table">
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      colon
      :style="{ marginBottom: '8px' }"
      @reset="handleReset"
      @submit="handleSubmit"
    >
      <t-row>
        <t-col :span="8">
          <t-row :gutter="[16, 24]">
            <t-col :span="4">
              <t-form-item label="唯一码" name="code">
                <t-input
                  v-model="formData.code"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入唯一码"
                  clearable
                  :style="{ minWidth: '80px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="关键字" name="word">
                <t-input
                  v-model="formData.word"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入关键字"
                  clearable
                  :style="{ minWidth: '80px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="授权资源" name="resource">
                <t-input
                  v-model="formData.resource"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入资源"
                  clearable
                  :style="{ minWidth: '80px' }"
                />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>

        <t-col :span="4" class="operation-container">
          <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询</t-button>
          <t-button type="reset" variant="base" theme="default"> 重置</t-button>
          <t-button theme="primary" @click="handleCreate">
            <t-icon name="add" />
            新建
          </t-button>
          <t-button theme="danger" @click="handleDelete">
            <t-icon name="delete" />
            删除
          </t-button>
        </t-col>
      </t-row>
    </t-form>

    <div class="table-container">
      <t-table
        :data="data"
        :columns="COLUMNS"
        :row-key="rowKey"
        :vertical-align="verticalAlign"
        :hover="hover"
        :pagination="pagination"
        :loading="dataLoading"
        :header-affixed-top="{ offsetTop, container: getContainer }"
        :selected-row-keys="selectedRowKeys"
        @select-change="handleSelectChange"
        @page-change="handlePageChange"
      >
        <template #op="slotProps">
          <a class="t-button-link" @click="handleRowEdit(slotProps)">编辑</a>
          <a class="t-button-link" @click="handleRowDelete(slotProps)">删除</a>
        </template>
      </t-table>
      <t-dialog
        v-model:visible="deleteVisible"
        header="确认删除？"
        :on-cancel="cancelDelete"
        @confirm="confirmDelete"
      />
      <t-dialog v-model:visible="editVisible" :header="editHeader" :on-cancel="cancelEdit" @confirm="confirmEdit">
        <t-form :data="editFormData">
          <t-form-item label="名称" name="name">
            <t-input v-model="editFormData.name" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="关键字" name="word">
            <t-input v-model="editFormData.word" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="授权资源" name="resource">
            <t-textarea
              v-model="editFormData.resource"
              placeholder="请输入内容(1行表示1个资源)"
              :autosize="{ minRows: 5 }"
            />
          </t-form-item>
        </t-form>
      </t-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useSettingStore } from '@/store';
import { prefix } from '@/config/global';
import { createAction, deleteAction, findAction, updateAction } from '@/api/action';

const store = useSettingStore();

const rowKey = 'id';
const verticalAlign = 'top';
const hover = true;
const pagination = ref({
  pageSize: 20,
  total: 100,
  current: 1,
});
const COLUMNS = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  {
    title: '序号',
    colKey: 'id',
    fixed: 'left',
    width: 220,
    ellipsis: true,
    align: 'left',
  },
  {
    title: '唯一码',
    colKey: 'code',
    width: 150,
    ellipsis: true,
  },
  {
    title: '名称',
    colKey: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '关键字',
    colKey: 'word',
    width: 200,
    ellipsis: true,
  },
  {
    title: '授权资源',
    colKey: 'resource',
    width: 200,
    ellipsis: true,
  },
  {
    align: 'left',
    fixed: 'right',
    width: 200,
    colKey: 'op',
    title: '操作',
  },
];

const searchForm = {
  code: '',
  word: '',
  resource: '',
};
const editForm = {
  name: '',
  word: '',
  resource: '',
};
const formData = ref({ ...searchForm });
const editFormData = ref({ ...editForm });
const deleteVisible = ref(false);
const editVisible = ref(false);
const editHeader = ref('');
const isEdit = ref(false);
const data = ref([]);
const selectedRowKeys = ref([]);
const dataLoading = ref(false);

const fetchData = async () => {
  dataLoading.value = true;
  const params = {
    ...formData.value,
    'page.num': pagination.value.current,
    'page.size': pagination.value.pageSize,
  };
  try {
    const { list, page } = await findAction(params);
    data.value = list;
    pagination.value = {
      current: Number(page.num),
      pageSize: Number(page.size),
      total: Number(page.total),
    };
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

const deleteIdx = ref(-1);

const resetIdx = () => {
  deleteIdx.value = -1;
};

const confirmDelete = async () => {
  await deleteByIds([deleteIdx.value]);
};

const cancelDelete = () => {
  resetIdx();
};

const showEdit = (row) => {
  if (row) {
    editFormData.value = row;
    editHeader.value = `编辑${row.id}`;
  } else {
    editHeader.value = '新增';
  }
  editVisible.value = true;
};

const cancelEdit = () => {
  editVisible.value = false;
};

const doCreate = async () => {
  try {
    await createAction(editFormData.value);
    MessagePlugin.success('新建成功');
    await fetchData();
    editVisible.value = false;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    dataLoading.value = false;
  }
};

const doEdit = async () => {
  try {
    await updateAction(editFormData.value);
    MessagePlugin.success('修改成功');
    await fetchData();
    editVisible.value = false;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    dataLoading.value = false;
  }
};

const confirmEdit = async () => {
  if (isEdit.value) {
    await doEdit();
  } else {
    await doCreate();
  }
};

const deleteByIds = async (ids) => {
  if (ids.length === 0) {
    MessagePlugin.warning('请至少选择一条数据');
    return;
  }
  try {
    await deleteAction(ids);
    MessagePlugin.success('删除成功');
    deleteVisible.value = false;
    resetIdx();
    await fetchData();
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      MessagePlugin.error(e.response.data.message);
    }
  } finally {
    selectedRowKeys.value = [];
  }
};

const handleRowEdit = ({ row }) => {
  isEdit.value = true;
  showEdit(row);
  console.log(row);
};

const handleRowDelete = ({ row }) => {
  deleteIdx.value = row.id;
  deleteVisible.value = true;
};

const handleCreate = ({ row }) => {
  isEdit.value = false;
  editFormData.value = editForm;
  showEdit(row);
};

const handleDelete = async () => {
  await deleteByIds(selectedRowKeys.value);
};

const handleSelectChange = (value) => {
  selectedRowKeys.value = value;
};

const handleReset = (val) => {
  console.log(val);
};

const handleSubmit = async ({ validateResult }) => {
  if (validateResult === true) {
    await fetchData();
  }
};

const handlePageChange = (curr) => {
  pagination.value.current = curr.current;
  pagination.value.pageSize = curr.pageSize;
  fetchData();
};

onMounted(() => {
  fetchData();
});

const offsetTop = computed(() => {
  return store.isUseTabsRouter ? 48 : 0;
});

const getContainer = () => {
  return document.querySelector(`.${prefix}-layout`);
};
</script>

<style lang="less" scoped>
.list-common-table {
  background-color: var(--td-bg-color-container);
  padding: 30px 32px;
  border-radius: @border-radius;

  .table-container {
    margin-top: 30px;
  }
}

.form-item-content {
  width: 100%;
}

.operation-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .expand {
    .t-button__text {
      display: flex;
      align-items: center;
    }

    .t-icon {
      margin-left: 4px;
      transition: transform 0.3s ease;
    }
  }
}

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}
</style>
