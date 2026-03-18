import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TEAM_MEMBERS } from '../../constants';
import { Avatar } from '../shared';
import styles from './Team.module.css';

function MemberCard({ member, assignedCount, doneCount }) {
  return (
    <div className={styles.memberCard}>
      <div className={styles.memberTop}>
        <Avatar name={member.id} color={member.color} size={34} />
        <div>
          <div className={styles.memberName}>{member.name}</div>
          <div className={styles.memberRole}>{member.role}</div>
        </div>
      </div>

      <div className={styles.skills}>
        {member.skills.map((skill) => (
          <span key={skill} className={styles.skill}>{skill}</span>
        ))}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Atribuidas</span>
          <span className={styles.statValue}>{assignedCount}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Concluidas</span>
          <span className={styles.statValueDone}>{doneCount}</span>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const { tasks } = useApp();

  const counters = useMemo(() => {
    const counts = {};
    TEAM_MEMBERS.forEach((member) => {
      const assigned = tasks.filter((task) => task.assignee === member.id).length;
      const done = tasks.filter((task) => task.assignee === member.id && task.status === 'DONE').length;
      counts[member.id] = { assigned, done };
    });
    return counts;
  }, [tasks]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Equipe</h2>
        <p className={styles.subtitle}>Visao consolidada de membros e distribuicao de tarefas no board.</p>
      </div>

      <div className={styles.grid}>
        {TEAM_MEMBERS.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            assignedCount={counters[member.id]?.assigned || 0}
            doneCount={counters[member.id]?.done || 0}
          />
        ))}
      </div>
    </div>
  );
}
