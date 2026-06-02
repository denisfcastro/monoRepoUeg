import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Jogo } from '../jogos/jogo.entity';
import { User } from '../users/user.entity';
import { Palpite } from '../palpites/palpite.entity';

@Entity('apostas')
export class Aposta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jogoId: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  palpiteId: string | null;

  @Column({ type: 'int' })
  golsCasa: number;

  @Column({ type: 'int' })
  golsVisitante: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.50 })
  odd: number;

  @ManyToOne(() => Jogo, (jogo) => jogo.apostas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jogoId' })
  jogo: Jogo;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Palpite, (palpite) => palpite.apostas, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'palpiteId' })
  palpite: Palpite | null;

  @CreateDateColumn()
  createdAt: Date;
}
