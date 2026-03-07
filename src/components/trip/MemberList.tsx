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
        🧳 Travel Crew ({members.length}/{MEMBER_LIMIT})
      </p>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {members.map((member, i) => (
          <div
            key={member.memberId}
            className="flex shrink-0 flex-col items-center gap-1"
            title={member.name}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white shadow-md ring-2 ring-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
            >
              {getInitials(member.name)}
            </div>
            <span className="max-w-[56px] truncate text-[11px] text-slate-500">
              {member.name.split(' ')[0]}
            </span>
          </div>
        ))}
        {members.length === 0 && <p className="text-[13px] text-slate-400">No members yet</p>}
      </div>
    </Card>
  );
}
