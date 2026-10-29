import { API_PATHS } from '@/config/paths'
import {
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '@/lib/notifications'
import { cleanParams } from '@/lib/collections'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PageQuery } from '@/types/api'

export interface NotificationListData {
  notifications: AppNotification[]
}

function patchNotificationList(
  dispatch: (action: unknown) => { undo: () => void },
  getState: () => unknown,
  updater: (items: AppNotification[]) => AppNotification[],
) {
  const args = notificationApi.util.selectCachedArgsForQuery(
    getState() as Parameters<typeof notificationApi.util.selectCachedArgsForQuery>[0],
    'getNotifications',
  )
  return args.map((queryArgs) =>
    dispatch(
      notificationApi.util.updateQueryData('getNotifications', queryArgs, (draft) => {
        draft.data.notifications = updater(draft.data.notifications)
      }),
    ),
  )
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiSuccess<NotificationListData>, PageQuery | void>({
      query: (params) => ({
        url: API_PATHS.notifications,
        params: cleanParams({
          page: params?.page,
          limit: params?.limit,
        }),
      }),
      providesTags: (result) => [
        { type: 'Notifications' as const, id: 'LIST' },
        ...(result?.data.notifications ?? []).map((item) => ({
          type: 'Notifications' as const,
          id: item._id,
        })),
      ],
    }),
    markNotificationRead: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: API_PATHS.markNotificationRead(id),
        method: 'PATCH',
      }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchNotificationList(dispatch, getState, (items) => markNotificationRead(items, id))
        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
    markAllNotificationsRead: builder.mutation<ApiSuccess<unknown>, void>({
      query: () => ({
        url: API_PATHS.markAllNotificationsRead,
        method: 'PATCH',
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        const patches = patchNotificationList(dispatch, getState, markAllNotificationsRead)
        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi
