import { useMemo } from '@lynx-js/react';
import styles from './Lessons.module.css';

interface Media {
  url: string;
  file_name: string;
  mime_type: string;
  size: number;
}

interface Block {
  id: number;
  block_type: 'text' | 'file' | 'image';
  content: string;
  media?: Media | null;
}

const mockData = {
  success: true,
  message: 'Permintaan berhasil diproses.',
  data: {
    id: 121,
    unit_id: 26,
    slug: 'implementing-design-patterns-26-1',
    title: 'Implementing Design Patterns',
    description: 'Understand the fundamentals and apply them to real-world scenarios.',
    order: 1,
    duration_minutes: 20,
    status: 'published',
    created_at: '2026-03-30T08:08:15+00:00',
    updated_at: '2026-03-30T08:08:15+00:00',
    xp_reward: 50,
    blocks: [
      {
        id: 471,
        lesson_id: 121,
        slug: 'implementing-design-patterns-block-1',
        block_type: 'text',
        content:
          "In practice, this technique is widely used across the industry. Many successful projects rely on this approach.\n\nUnderstanding this principle will help you make better design decisions and write more maintainable code.\n\nThis concept is fundamental to understanding how the system works. By mastering this, you'll be able to apply it across various scenarios.",
        order: 1,
        external_url: null,
        embed_url: null,
        media: null,
        metadata: null,
        created_at: '2026-03-30T08:08:15+00:00',
        updated_at: '2026-03-30T08:08:15+00:00',
      },
      {
        id: 472,
        lesson_id: 121,
        slug: 'implementing-design-patterns-block-2',
        block_type: 'file',
        content:
          '<div class="file-download"><h4>Impedit eum quae quae omnis.</h4><p>Accusamus quisquam sit debitis omnis. Odio deleniti veniam ipsam unde illum ut fugiat. Dolor sed tenetur dolorem pariatur. Odio et qui in accusamus. Sit exercitationem dignissimos quam in voluptas repellendus.</p><a href="" download>Download File</a></div>',
        order: 2,
        external_url: null,
        embed_url: null,
        media: {
          url: 'https://levl-assets.sgp1.digitaloceanspaces.com/lesson_blocks/472/media/1408/file_example_XLS_5000.xls?v=1774858095',
          id: 1408,
          file_name: 'file_example_XLS_5000.xls',
          mime_type: 'application/vnd.ms-excel',
          size: 672256,
        },
        metadata: null,
        created_at: '2026-03-30T08:08:15+00:00',
        updated_at: '2026-03-30T08:08:15+00:00',
      },
      {
        id: 473,
        lesson_id: 121,
        slug: 'implementing-design-patterns-block-3',
        block_type: 'text',
        content:
          "Understanding this principle will help you make better design decisions and write more maintainable code.\n\nLet's explore this topic in detail. We'll look at practical examples and see how professionals use these techniques in production environments.",
        order: 3,
        external_url: null,
        embed_url: null,
        media: null,
        metadata: null,
        created_at: '2026-03-30T08:08:16+00:00',
        updated_at: '2026-03-30T08:08:16+00:00',
      },
      {
        id: 474,
        lesson_id: 121,
        slug: 'implementing-design-patterns-block-4',
        block_type: 'file',
        content:
          '<div class="file-download"><h4>Eius eum soluta repellendus praesentium modi.</h4><p>Assumenda eius at inventore. Ut a rerum et odit voluptatum. Dolore doloremque ea provident non debitis sed. Itaque sunt commodi molestiae ut.</p><a href="" download>Download File</a></div>',
        order: 4,
        external_url: null,
        embed_url: null,
        media: {
          url: 'https://levl-assets.sgp1.digitaloceanspaces.com/lesson_blocks/474/media/1409/pdf-sample_0.pdf?v=1774858096',
          id: 1409,
          file_name: 'pdf-sample_0.pdf',
          mime_type: 'application/pdf',
          size: 13264,
        },
        metadata: null,
        created_at: '2026-03-30T08:08:16+00:00',
        updated_at: '2026-03-30T08:08:16+00:00',
      },
      {
        id: 475,
        lesson_id: 121,
        slug: 'implementing-design-patterns-block-5',
        block_type: 'image',
        content:
          '<figure><img src="" alt="dolore ipsam aut quis dolores" /><figcaption>Veniam illo occaecati quia quia dolorem voluptates.</figcaption></figure>',
        order: 5,
        external_url: null,
        embed_url: null,
        media: {
          url: 'https://levl-assets.sgp1.digitaloceanspaces.com/lesson_blocks/475/media/1410/file_example_PNG_500kB-(1).png?v=1774858096',
          id: 1410,
          file_name: 'file_example_PNG_500kB-(1).png',
          mime_type: 'image/png',
          size: 512596,
        },
        metadata: null,
        created_at: '2026-03-30T08:08:16+00:00',
        updated_at: '2026-03-30T08:08:16+00:00',
      },
    ],
  },
  meta: null,
  errors: null,
};

const LessonPage = () => {
  const { title, description, blocks } = mockData.data;

  // Helper to strip HTML tags for simple text blocks
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  return (
    <scroll-view className={styles.scrollView} scroll-y>
      {/* Header Section */}
      <view className={styles.header}>
        <text className={styles.title}>{title}</text>
        <text className={styles.description}>{description}</text>
      </view>

      {/* Dynamic Blocks */}
      {blocks.map((block) => (
        <view key={block.id} className={styles.blockWrapper}>
          {block.block_type === 'text' && (
            <text className={styles.textContent}>{block.content}</text>
          )}

          {block.block_type === 'image' && block.media && (
            <view className={styles.imageCard}>
              <image src={block.media.url} className={styles.image} mode="aspectFill" />
              <text className={styles.caption}>
                {stripHtml(block.content) || block.media.file_name}
              </text>
            </view>
          )}

          {block.block_type === 'file' && block.media && (
            <view className={styles.fileCard}>
              <view className={styles.fileInfo}>
                <text className={styles.fileName}>{block.media.file_name}</text>
                <text className={styles.fileSize}>
                  {(block.media.size / 1024).toFixed(1)} KB •{' '}
                  {block.media.mime_type.split('/')[1].toUpperCase()}
                </text>
              </view>
              <view
                className={styles.downloadBtn}
                bindtap={() => console.log('Downloading:', block.media?.url)}
              >
                <text className={styles.downloadText}>Download</text>
              </view>
            </view>
          )}
        </view>
      ))}

      {/* Bottom Spacer */}
      <view style={{ height: '40px' }} />
    </scroll-view>
  );
};

export default LessonPage;
