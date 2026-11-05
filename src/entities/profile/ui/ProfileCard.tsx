import type { PublicProfile } from '../model/schemas';

interface Props {
  profile: PublicProfile;
  className?: string;
}

export function ProfileCard({ profile, className = '' }: Props) {
  return (
    <div className={`flex flex-col bg-card rounded-2xl overflow-hidden shadow-lg ${className}`}>
      <div className="relative h-72 bg-muted flex items-center justify-center overflow-hidden">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl text-muted-foreground font-bold">{profile.name[0]}</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-white text-2xl font-bold">
            {profile.name}, {profile.age}
          </h2>
          <p className="text-white/80 text-sm">{profile.city}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
        )}
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 6).map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
