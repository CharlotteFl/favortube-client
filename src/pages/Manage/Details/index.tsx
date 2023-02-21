import * as React from 'react';
import styles from './index.less';
import { useEffect, useState, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'umi';
import {
  UploadOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  message,
  Modal,
  Upload,
  Input,
  Select,
  Progress,
  Spin,
} from 'antd';
const { TextArea } = Input;
import { usePath, useUrl } from '@/utils/hooks';
import TagsEdit from '@/components/TagsEdit';
import ImageCrop from '@/components/ImageCrop';
import { UpdateVideo } from '@/declare/tubeApiType';
import { Models } from '@/declare/modelType';
import VideoApi from '@/services/tube/VideoApi';

export type Props = {
  match: {
    params: {
      id: string;
    };
  };
};
const Details: React.FC<Props> = (props) => {
  const path = usePath();
  const url = useUrl();
  const dispatch = useDispatch();
  const [submitDisable, setSubmitDisable] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [thumbnailLoading, setThumbnailLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateVideo>({
    title: '',
    description: '',
    tags: [],
    thumbnail: '',
    category: '',
  });

  const { refreshVideoList } = useSelector((state: Models) => state.manage);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const getVideoDetailById = async (id: string) => {
    try {
      const { data } = await VideoApi.getVideo(url, id);
      if (data.data) {
        const videoData = data.data;
        setFormData({
          ...formData,
          title: videoData.title,
          description: videoData.description,
          tags: videoData.tags,
          thumbnail: videoData.thumbnail,
          category: videoData.category,
        });
      }
      setSubmitDisable(false);
    } catch (e) {
      setSubmitDisable(true);
      if (e instanceof Error) message.error(e.message);
    }
  };

  const checkRequired = (value: string) => {
    if (value) setSubmitDisable(false);
    else setSubmitDisable(true);
  };

  const submit = async () => {
    setSubmitLoading(true);
    try {
      const { data } = await VideoApi.updateVideo(url, props.match.params.id, {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        thumbnail: formData.thumbnail,
        category: formData.category,
      });
      path('/manage');
      dispatch({
        type: 'manage/updateState',
        payload: {
          refreshVideoList: !refreshVideoList,
        },
      });
    } catch (e) {
      if (e instanceof Error) message.error(e.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  useLayoutEffect(() => {
    getVideoDetailById(props.match.params.id);
  }, []);

  return (
    <>
      <div className={styles.content}>
        <div className={styles.backBtn}>
          <Button
            type="primary"
            onClick={() => {
              path('/videos/manage');
            }}
          >
            <ArrowLeftOutlined />
            Channel Videos
          </Button>
        </div>
        <div className={styles.uploadVideoDetail}>
          <div className={`${styles.subTitle} ${styles.item}`}>
            <p className={styles.label}>Details</p>
          </div>
          <div className={`${styles.videoTitle} ${styles.item}`}>
            <p className={styles.label}>Title</p>
            <Input
              className={styles.value}
              showCount
              maxLength={100}
              placeholder="Please enter video title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                checkRequired(e.target.value);
              }}
            />
          </div>
          <div className={`${styles.videoDesc} ${styles.item}`}>
            <p className={styles.label}>Description</p>
            <TextArea
              allowClear
              showCount
              maxLength={5000}
              autoSize={{ minRows: 2, maxRows: 5 }}
              placeholder="Please enter channel description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
            />
          </div>
          <div className={`${styles.videoTags} ${styles.item}`}>
            <p className={styles.label}>Tags</p>
            {formData.tags?.length ? (
              <TagsEdit
                tagsData={formData.tags}
                setTagsData={(tags) => {
                  setFormData({ ...formData, tags });
                }}
              />
            ) : (
              <></>
            )}
          </div>
          <div className={`${styles.videoCategory} ${styles.item}`}>
            <p className={styles.label}>Category</p>
            <Input
              className={styles.value}
              showCount
              maxLength={100}
              placeholder="Please enter video category"
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
              }}
            />
          </div>
          <div className={`${styles.videoThumbnail} ${styles.item}`}>
            <p className={styles.label}>Thumbnail</p>
            <div className={styles.cropWrap}>
              <ImageCrop
                url={formData.thumbnail}
                shape="rect"
                aspect={2}
                setImgBase64={(imgBase64) => {
                  setFormData({ ...formData, thumbnail: imgBase64 });
                }}
              />
              {thumbnailLoading ? (
                <Spin size="large" indicator={antIcon} />
              ) : (
                <></>
              )}
            </div>
          </div>
          <Divider style={{ margin: '16px 0' }} />
          <div className={styles.footer}>
            <Button
              className={styles.submit}
              type="primary"
              disabled={submitDisable}
              loading={submitLoading}
              onClick={submit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Details;