import type { Member } from '@/types';
import { MEMBER_LIMIT } from '@/lib/constants';
import Card from '@/components/ui/Card';

interface MemberListProps {
  members: Member[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-ocean',
  'bg-sunset',
  'bg-forest',
  'bg-ocean-dark',
  'bg-red',
  'bg-slate-600',
  'bg-ocean',
  'bg-sunset',
];

export default function MemberList({ members }: MemberListProps) {
  return (
    <Card>
      <p className="mb-3 text-[13px] font-semibold text-slate-600">
        Members ({members.length}/{MEMBER_LIMIT})
      </p>
      <div className="flex items-center gap-2 overflow-x-auto">
        {members.map((member, i) => (
          <div
            key={member.memberId}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
            title={member.name}
          >
            {getInitials(member.name)}
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-[13px] text-slate-400">No members yet</p>
        )}
      </div>
    </Card>
  );
}
