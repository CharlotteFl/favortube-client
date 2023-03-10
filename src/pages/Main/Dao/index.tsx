import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { history, useParams, useSelector } from 'umi';
import styles from './index.less';
import DaoApi from '@/services/tube/Dao';
import { useUrl } from '@/utils/hooks';
import { DaoInfo } from '@/declare/tubeApiType';
import { useDebounceFn } from 'ahooks';
import { Models } from '@/declare/modelType';
import MyAttention from '@/components/MyAttention';
import CommunityCard from '@/components/CommunityCard';
import JumpIconButton from '@/components/JumpIconButton';
import PostList from '@/components/PostList';

export type Props = {};

const DaoList: React.FC<Props> = (props) => {
  const params: { daoId?: string } = useParams();
  const url = useUrl();
  const [bookmarkList, setBookmarkList] = useState<DaoInfo[]>([]);
  const [isBookmark, setIsBookmark] = useState(false);
  const { userInfo } = useSelector((state: Models) => state.dao);
  const [daoId, setDaoId] = useState(params.daoId || userInfo?.id);
  const [daoInfo, setDaoInfo] = useState<DaoInfo>();

  const getDaoInfo = async () => {
    if (!daoId) return;
    const { data } = await DaoApi.getById(url, daoId);
    setDaoInfo(data.data);
  };
  const getBookmarkList = async () => {
    const { data } = await DaoApi.getBookmarkList(url);
    if (data.data.list.length) {
      setBookmarkList(data.data.list);
      if (!daoId) setDaoId(data.data.list[0].id);
    }
  };

  const bookmarkHandle = async () => {
    if (!daoId) return;
    const { data } = await DaoApi.bookmark(url, daoId);
    setIsBookmark(data.data.status);
  };

  const checkBookmark = async () => {
    if (!daoId) return;
    if (userInfo?.id === daoId) return setIsBookmark(true);
    const { data } = await DaoApi.checkBookmark(url, daoId);
    setIsBookmark(data.data.status);
  };

  useEffect(() => {
    getBookmarkList();
  }, []);

  useEffect(() => {
    checkBookmark();
    getDaoInfo();
  }, [daoId]);

  return (
    <>
      <div className={styles.content}>
        <MyAttention
          user={userInfo}
          joinedList={bookmarkList}
          setDaoId={setDaoId}
          daoId={daoId}
        />
        {daoId ? (
          <>
            <CommunityCard
              status={isBookmark}
              handle={bookmarkHandle}
              daoInfo={daoInfo}
              daoId={daoId}
            />
            <div className={styles.jumpBlock}>
              <JumpIconButton type={0} daoId={daoId} />
              <JumpIconButton type={1} daoId={daoId} />
              <JumpIconButton type={2} daoId={daoId} />
            </div>
            <div className={styles.underLine}></div>
            <PostList daoId={daoId} />
          </>
        ) : (
          <div className={styles.createPage}>
            <div className={styles.noCreateBackGround}></div>
            <p className={styles.noCreateText}>
              Nothing. Go create or join a community!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DaoList;
