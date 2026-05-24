import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CreateScreen() {
  return (
    <ScreenContainer>
      <EmptyState title="Paylaş" description="Bir sonraki adımda gelecek." />
    </ScreenContainer>
  );
}
