import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Jogo } from '../jogos/jogo.entity';
import { Aposta } from '../apostas/aposta.entity';

@Entity('palpites')
export class Palpite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jogoId: string;

  @Column({ type: 'int' })
  golsCasa: number;

  @Column({ type: 'int' })
  golsVisitante: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.50 })
  odd: number;

  @ManyToOne(() => Jogo, (jogo) => jogo.palpites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jogoId' })
  jogo: Jogo;

  @OneToMany(() => Aposta, (aposta) => aposta.palpite)
  apostas: Aposta[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
