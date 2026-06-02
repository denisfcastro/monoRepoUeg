import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Palpite } from '../palpites/palpite.entity';
import { Aposta } from '../apostas/aposta.entity';

@Entity('jogos')
export class Jogo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  selecaoCasa: string;

  @Column()
  selecaoVisitante: string;

  @Column({ type: 'varchar' })
  dataJogo: string; // YYYY-MM-DD

  @Column({ type: 'varchar' })
  horarioJogo: string; // HH:mm

  @Column()
  estadio: string;

  @Column()
  nomeJuiz: string;

  @Column({ default: false })
  encerrado: boolean;

  @OneToMany(() => Palpite, (palpite) => palpite.jogo, { cascade: true })
  palpites: Palpite[];

  @OneToMany(() => Aposta, (aposta) => aposta.jogo, { cascade: true })
  apostas: Aposta[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
